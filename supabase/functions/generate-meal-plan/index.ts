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

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get meal plan details
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from('meal_plans')
      .select('*, selected_books')
      .eq('id', mealPlanId)
      .single();

    if (mealPlanError) {
      console.error('Error fetching meal plan:', mealPlanError);
      throw new Error('Failed to fetch meal plan details');
    }

    if (!mealPlan) {
      throw new Error('Meal plan not found');
    }

    console.log('Meal plan details:', mealPlan);

    // Get recipes from selected books
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, book_title')
      .in('book_title', mealPlan.selected_books || [])
      .limit(20);

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      throw new Error('Failed to fetch recipes');
    }

    if (!recipes || recipes.length === 0) {
      console.error('No recipes found for selected books:', mealPlan.selected_books);
      throw new Error('No recipes found for selected books');
    }

    console.log('Available recipes:', recipes);

    const prompt = `Create a simple meal plan using these recipes: ${recipes.map(r => `${r.id}: ${r.title}`).join(', ')}. 
Return a JSON object with meal_plan_items array. Each item must have:
- day_of_week (integer 1-7)
- meal_type (one of: ${mealPlan.meals_per_day.join(', ')})
- recipe_id (from available recipes)
- servings (integer 1-8)

Example format:
{
  "meal_plan_items": [
    {
      "day_of_week": 1,
      "meal_type": "breakfast",
      "recipe_id": 123,
      "servings": 4
    }
  ]
}`;

    console.log('Sending prompt to OpenAI:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a meal planning assistant. Always return valid JSON with day_of_week as integers 1-7.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate meal plan with OpenAI');
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    const mealPlanItems = JSON.parse(data.choices[0].message.content);
    console.log('Parsed meal plan items:', mealPlanItems);

    // Validate day_of_week values
    const invalidDays = mealPlanItems.meal_plan_items.filter(
      (item: any) => !Number.isInteger(item.day_of_week) || item.day_of_week < 1 || item.day_of_week > 7
    );

    if (invalidDays.length > 0) {
      console.error('Invalid day_of_week values found:', invalidDays);
      throw new Error('Invalid day_of_week values in generated plan');
    }

    // Add meal_plan_id to each item
    const itemsToInsert = mealPlanItems.meal_plan_items.map((item: any) => ({
      ...item,
      meal_plan_id: mealPlanId
    }));

    // Insert meal plan items
    const { error: insertError } = await supabase
      .from('meal_plan_items')
      .insert(itemsToInsert);

    if (insertError) {
      console.error('Error inserting meal plan items:', insertError);
      throw new Error('Failed to save meal plan items');
    }

    console.log('Successfully saved meal plan items');

    return new Response(JSON.stringify({ success: true, data: mealPlanItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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