import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_MEAL_TYPES = [
  "breakfast",
  "lunch", 
  "dinner",
  "morning_snack",
  "afternoon_snack",
  "evening_snack"
] as const;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealPlanId } = await req.json();
    console.log('Generating meal plan for ID:', mealPlanId);

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First get the meal plan to get the user_id
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', mealPlanId)
      .single();

    if (mealPlanError) {
      console.error('Error fetching meal plan:', mealPlanError);
      throw new Error('Failed to fetch meal plan details');
    }

    if (!mealPlan) {
      throw new Error('Meal plan not found');
    }

    // Get recipes from WordPress API
    try {
      const url = 'https://brainscapebooks.com/wp-json/custom/v1/recipes';
      console.log('Fetching recipes from URL:', url);
      
      const response = await fetch(url);
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`Error fetching recipes: ${response.status} ${response.statusText}`);
        console.error('Response body:', responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const wpRecipes = JSON.parse(responseText);
      console.log('Total WordPress recipes fetched:', wpRecipes.length);

      // Insert recipes into Supabase if they don't exist
      for (const recipe of wpRecipes) {
        const { data: existingRecipe } = await supabase
          .from('recipes')
          .select('id')
          .eq('id', recipe.id)
          .single();

        if (!existingRecipe) {
          const { error: insertError } = await supabase
            .from('recipes')
            .insert({
              id: recipe.id,
              title: recipe.title,
              description: recipe.content,
              ingredients: recipe.acf?.ingredients?.map((i: any) => i.ingredient_item) || [],
              instructions: recipe.acf?.instructions?.map((i: any) => i.instructions_step) || [],
              prep_time: recipe.acf?.prep_time,
              cook_time: recipe.acf?.cook_time,
              servings: parseInt(recipe.acf?.servings) || 4,
              meal_type: recipe.acf?.meal_type,
              book_title: recipe.acf?.libro_associato?.[0]?.post_title
            });

          if (insertError) {
            console.error('Error inserting recipe:', insertError);
          }
        }
      }

      // Now get recipes from Supabase
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('id, title');

      if (recipesError) {
        throw recipesError;
      }

      if (!recipes || recipes.length === 0) {
        throw new Error('No recipes available');
      }

      console.log('Available recipes:', recipes);

      // Use the meal types from meals_per_day
      const selectedMealTypes = (mealPlan.meals_per_day || []).filter(type => 
        VALID_MEAL_TYPES.includes(type as any)
      );

      if (selectedMealTypes.length === 0) {
        throw new Error('No valid meal types selected');
      }

      console.log('Selected meal types:', selectedMealTypes);

      const prompt = `Create a simple meal plan using these recipes: ${recipes.map(r => `${r.id}: ${r.title}`).join(', ')}. 
Return a JSON object with meal_plan_items array. Each item must have:
- day_of_week (integer 1-6)
- meal_type (must be exactly one of these: ${selectedMealTypes.join(', ')})
- recipe_id (from available recipes)
- servings (integer 1-8)

Example format:
{
  "meal_plan_items": [
    {
      "day_of_week": 1,
      "meal_type": "${selectedMealTypes[0]}",
      "recipe_id": ${recipes[0].id},
      "servings": 4
    }
  ]
}`;

      console.log('Sending prompt to OpenAI:', prompt);

      if (!openAIApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { 
              role: 'system', 
              content: 'You are a meal planning assistant. Always return valid JSON with day_of_week as integers 1-6 and meal_type exactly matching the provided options.'
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!openAIResponse.ok) {
        const error = await openAIResponse.json();
        console.error('OpenAI API error:', error);
        throw new Error('Failed to generate meal plan with OpenAI');
      }

      const data = await openAIResponse.json();
      console.log('OpenAI response:', data);

      let mealPlanItems;
      try {
        const content = data.choices[0].message.content;
        console.log('Parsing OpenAI response content:', content);
        mealPlanItems = JSON.parse(content);
        console.log('Parsed meal plan items:', mealPlanItems);
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        throw new Error('Invalid response format from OpenAI');
      }

      if (!mealPlanItems?.meal_plan_items || !Array.isArray(mealPlanItems.meal_plan_items)) {
        console.error('Invalid meal plan items structure:', mealPlanItems);
        throw new Error('Invalid meal plan items structure from OpenAI');
      }

      // Validate day_of_week values and meal types
      const invalidItems = mealPlanItems.meal_plan_items.filter(
        (item: any) => 
          !Number.isInteger(item.day_of_week) || 
          item.day_of_week < 1 || 
          item.day_of_week > 6 ||  // Changed from 7 to 6 to match database constraint
          !selectedMealTypes.includes(item.meal_type)
      );

      if (invalidItems.length > 0) {
        console.error('Invalid items found:', invalidItems);
        throw new Error('Invalid values in generated plan. Check day_of_week (must be 1-6) and meal_type.');
      }

      // Validate recipe_ids exist in our database
      const recipeIds = mealPlanItems.meal_plan_items.map((item: any) => item.recipe_id);
      const { data: existingRecipes } = await supabase
        .from('recipes')
        .select('id')
        .in('id', recipeIds);

      const validRecipeIds = new Set(existingRecipes?.map(r => r.id) || []);
      const invalidRecipeItems = mealPlanItems.meal_plan_items.filter(
        (item: any) => !validRecipeIds.has(item.recipe_id)
      );

      if (invalidRecipeItems.length > 0) {
        console.error('Items with invalid recipe_ids:', invalidRecipeItems);
        throw new Error('Some recipes do not exist in the database');
      }

      // Add meal_plan_id to each item
      const itemsToInsert = mealPlanItems.meal_plan_items.map((item: any) => ({
        ...item,
        meal_plan_id: mealPlanId
      }));

      console.log('Attempting to insert meal plan items:', itemsToInsert);

      // Insert meal plan items
      const { error: insertError } = await supabase
        .from('meal_plan_items')
        .insert(itemsToInsert);

      if (insertError) {
        console.error('Error inserting meal plan items:', insertError);
        throw new Error(`Failed to save meal plan items: ${insertError.message}`);
      }

      console.log('Successfully saved meal plan items');

      return new Response(JSON.stringify({ success: true, data: mealPlanItems }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching WordPress recipes:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in generate-meal-plan function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate meal plan',
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});