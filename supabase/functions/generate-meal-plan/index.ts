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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { mealPlanId } = await req.json();
    
    if (!mealPlanId) {
      throw new Error('No meal plan ID provided');
    }

    console.log('Generating meal plan for ID:', mealPlanId);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // First fetch meal plan details
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', mealPlanId)
      .single();

    if (mealPlanError) throw mealPlanError;
    if (!mealPlan) throw new Error('Meal plan not found');

    console.log('Fetched meal plan:', mealPlan);

    // Separately fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('dietary_preferences, allergies, favorite_cuisines, cooking_skill_level')
      .eq('id', mealPlan.user_id)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    console.log('Fetched profile:', profile);

    // Fetch available recipes based on selected books
    let recipesQuery = supabase.from('recipes').select('*');
    
    // If selected books are specified, filter recipes accordingly
    if (mealPlan.selected_books && mealPlan.selected_books.length > 0) {
      // Here you would add logic to filter recipes by book
      // For now, we'll fetch all recipes as the book-recipe relationship isn't established
      console.log('Selected books:', mealPlan.selected_books);
    }

    const { data: recipes, error: recipesError } = await recipesQuery;

    if (recipesError) throw recipesError;
    if (!recipes) throw new Error('No recipes found');

    console.log('Fetched recipes count:', recipes.length);

    // Create prompt for OpenAI
    const prompt = `Create a meal plan with the following requirements:
Duration: ${mealPlan.duration}
Daily calorie target: ${mealPlan.daily_calories}
Objective: ${mealPlan.objective}
Meals per day: ${mealPlan.meals_per_day.join(', ')}
Time constraint: ${mealPlan.time_constraint}
Excluded ingredients: ${mealPlan.excluded_ingredients?.join(', ') || 'None'}
Preferred cuisines: ${mealPlan.preferred_cuisines?.join(', ') || 'Any'}
Dietary preferences: ${profile.dietary_preferences?.join(', ') || 'None'}
Cooking skill level: ${profile.cooking_skill_level || 'Intermediate'}

Available recipes: ${recipes.map(r => `${r.id}: ${r.title}`).join(', ')}

Please create a meal plan that assigns recipes to each meal for each day of the plan. For each meal, select an appropriate recipe from the available recipes list that matches the requirements. Return the response in this JSON format:
{
  "meal_plan_items": [
    {
      "day_of_week": number,
      "meal_type": string,
      "recipe_id": number,
      "servings": number
    }
  ]
}`;

    console.log('Sending prompt to OpenAI');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful meal planning assistant that creates personalized meal plans based on user preferences and available recipes. Always return valid JSON that matches the requested format exactly.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate meal plan');
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    const mealPlanItems = JSON.parse(data.choices[0].message.content);
    console.log('Parsed meal plan items:', mealPlanItems);

    // Save generated meal plan items to database
    const { error: insertError } = await supabase
      .from('meal_plan_items')
      .insert(mealPlanItems.meal_plan_items.map((item: any) => ({
        ...item,
        meal_plan_id: mealPlanId
      })));

    if (insertError) throw insertError;

    console.log('Successfully saved meal plan items');

    return new Response(JSON.stringify({ success: true, data: mealPlanItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-meal-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});