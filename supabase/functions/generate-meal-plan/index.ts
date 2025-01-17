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

    // First get the meal plan to get the user_id and selected_books
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

    console.log('Meal plan selected books:', mealPlan.selected_books);

    if (!mealPlan.selected_books || mealPlan.selected_books.length === 0) {
      throw new Error('No books selected for meal plan');
    }

    // Get recipes from WordPress API
    try {
      const url = 'https://brainscapebooks.com/wp-json/custom/v1/recipes';
      console.log('Fetching recipes from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const allRecipes = await response.json();
      console.log('Total WordPress recipes fetched:', allRecipes.length);

      // Filter recipes based on selected books
      const selectedBooks = new Set(mealPlan.selected_books);
      const filteredRecipes = allRecipes.filter((recipe: any) => {
        const bookTitle = recipe.acf?.libro_associato?.[0]?.post_title;
        return bookTitle && selectedBooks.has(bookTitle);
      });

      console.log('Filtered recipes for selected books:', filteredRecipes.length);

      if (filteredRecipes.length === 0) {
        throw new Error('No recipes found for selected books');
      }

      // Insert filtered recipes into Supabase if they don't exist
      for (const recipe of filteredRecipes) {
        const { data: existingRecipe } = await supabase
          .from('recipes')
          .select('id')
          .eq('id', recipe.id)
          .single();

        if (!existingRecipe) {
          const ingredients = Array.isArray(recipe.acf?.ingredients) 
            ? recipe.acf.ingredients.map((i: any) => i.ingredient_item || i).filter(Boolean)
            : [];
            
          const instructions = Array.isArray(recipe.acf?.instructions)
            ? recipe.acf.instructions.map((i: any) => i.instructions_step || i).filter(Boolean)
            : [];

          const { error: insertError } = await supabase
            .from('recipes')
            .insert({
              id: recipe.id,
              title: recipe.title,
              description: recipe.content,
              ingredients: ingredients,
              instructions: instructions,
              prep_time: recipe.acf?.prep_time,
              cook_time: recipe.acf?.cook_time,
              servings: parseInt(recipe.acf?.servings) || 4,
              meal_type: recipe.acf?.pasto,
              book_title: recipe.acf?.libro_associato?.[0]?.post_title
            });

          if (insertError) {
            console.error('Error inserting recipe:', insertError);
            continue;
          }
        }
      }

      // Use the meal types from meals_per_day
      const selectedMealTypes = mealPlan.meals_per_day || [];

      if (selectedMealTypes.length === 0) {
        throw new Error('No meal types selected');
      }

      console.log('Selected meal types:', selectedMealTypes);

      if (!openAIApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const systemPrompt = `You are a meal planning assistant. Generate a meal plan using ONLY the recipes I provide.
Your response must be a valid JSON object with this exact structure:
{
  "meal_plan_items": [
    {
      "day_of_week": <number between 0 and 6 inclusive, where 0 is Sunday>,
      "meal_type": <string matching one of: ${selectedMealTypes.join(', ')}>,
      "recipe_id": <number matching one of the provided recipe IDs>,
      "servings": <number between 1 and 8 inclusive>
    }
  ]
}
IMPORTANT: day_of_week MUST be a number between 0 and 6 inclusive, where 0 represents Sunday.
Do not add any explanations or additional fields. Return ONLY the JSON object.`;

      const userPrompt = `Create a meal plan using only these recipes (format is ID: Title): 
${filteredRecipes.map(r => `${r.id}: ${r.title}`).join('\n')}`;

      console.log('Sending prompts to OpenAI:', { systemPrompt, userPrompt });

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!openAIResponse.ok) {
        const error = await openAIResponse.text();
        console.error('OpenAI API error response:', error);
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await openAIResponse.json();
      console.log('OpenAI raw response:', data);

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid OpenAI response structure:', data);
        throw new Error('Invalid response from OpenAI');
      }

      let mealPlanItems;
      try {
        const content = data.choices[0].message.content.trim();
        console.log('Parsing OpenAI response content:', content);
        mealPlanItems = JSON.parse(content);
        console.log('Parsed meal plan items:', mealPlanItems);
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        throw new Error('Invalid JSON format in OpenAI response');
      }

      if (!mealPlanItems?.meal_plan_items || !Array.isArray(mealPlanItems.meal_plan_items)) {
        console.error('Invalid meal plan items structure:', mealPlanItems);
        throw new Error('Invalid meal plan structure in OpenAI response');
      }

      // Validate meal plan items before insertion
      mealPlanItems.meal_plan_items.forEach((item: any) => {
        if (!Number.isInteger(item.day_of_week) || item.day_of_week < 0 || item.day_of_week > 6) {
          throw new Error(`Invalid day_of_week value: ${item.day_of_week}. Must be between 0 and 6.`);
        }
        if (!selectedMealTypes.includes(item.meal_type)) {
          throw new Error(`Invalid meal_type: ${item.meal_type}`);
        }
        if (!Number.isInteger(item.servings) || item.servings < 1 || item.servings > 8) {
          throw new Error(`Invalid servings value: ${item.servings}. Must be between 1 and 8.`);
        }
      });

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