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

    // Then get the user's profile book
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('book_id')
      .eq('id', mealPlan.user_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    // Get additional books from user_coupons
    const { data: userCoupons, error: couponsError } = await supabase
      .from('user_coupons')
      .select('book_id')
      .eq('user_id', mealPlan.user_id);

    if (couponsError) {
      console.error('Error fetching user coupons:', couponsError);
      throw new Error('Failed to fetch user coupons');
    }

    // Combine book IDs
    const bookIds = new Set<string>();
    if (profile?.book_id) {
      bookIds.add(profile.book_id);
    }
    if (userCoupons) {
      userCoupons.forEach(coupon => {
        bookIds.add(coupon.book_id);
      });
    }

    console.log('Book IDs to fetch recipes from:', Array.from(bookIds));

    if (bookIds.size === 0) {
      throw new Error('No books found for user');
    }

    // Get recipes from WordPress API
    const recipes = [];
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
      
      const allRecipes = JSON.parse(responseText);
      console.log('Total recipes fetched:', allRecipes.length);
      
      // Filter recipes based on book IDs
      const bookRecipes = allRecipes.filter((recipe: any) => 
        recipe.acf?.libro_associato?.some((book: any) => 
          bookIds.has(book.ID.toString())
        )
      );
      
      console.log(`Found ${bookRecipes.length} recipes for selected books`);
      
      recipes.push(...bookRecipes.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        prep_time: recipe.acf?.prep_time || '',
        cook_time: recipe.acf?.cook_time || '',
        servings: parseInt(recipe.acf?.servings) || 4
      })));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }

    if (!recipes || recipes.length === 0) {
      console.error('No recipes found for books:', Array.from(bookIds));
      throw new Error(`No recipes found for selected books. Book IDs: ${Array.from(bookIds).join(', ')}`);
    }

    console.log('Available recipes:', recipes);

    const prompt = `Create a simple meal plan using these recipes: ${recipes.map(r => `${r.id}: ${r.title}`).join(', ')}. 
Return a JSON object with meal_plan_items array. Each item must have:
- day_of_week (integer 1-7)
- meal_type (one of: ${mealPlan.meals_per_day?.join(', ')})
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
        model: 'gpt-4o-mini',
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

    // Validate meal plan items
    if (!mealPlanItems?.meal_plan_items || !Array.isArray(mealPlanItems.meal_plan_items)) {
      console.error('Invalid meal plan items structure:', mealPlanItems);
      throw new Error('Invalid meal plan items structure from OpenAI');
    }

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