export interface Recipe {
  id: number;
  title: string;
  content: string;
  acf: {
    prep_time: string;
    cook_time: string;
    pasto: string;
    servings: string;
    meal_type: string;
    ingredients: Array<{
      ingredient_item: string;
    }>;
    instructions: Array<{
      instructions_step: string;
    }>;
    recipe_image: {
      url: string;
    };
    libro_associato: Array<{
      ID: number;
      post_title: string;
    }>;
    nutrition_facts: Array<{
      instructions_step: string;
    }>;
    audio_recipe?: string;
  };
}