import { Recipe } from "@/types/recipe";
import { RecipeMetadata } from "./RecipeMetadata";
import { RecipeContent } from "./RecipeContent";

interface RecipeDetailsProps {
  recipe: Recipe;
}

export function RecipeDetails({ recipe }: RecipeDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
        <div 
          className="text-gray-600" 
          dangerouslySetInnerHTML={{ __html: recipe.content }} 
        />
      </div>

      <RecipeMetadata
        prepTime={recipe.acf.prep_time}
        cookTime={recipe.acf.cook_time}
        servings={recipe.acf.servings || recipe.acf.pasto}
      />

      <RecipeContent
        ingredients={recipe.acf.ingredients || []}
        instructions={recipe.acf.instructions || []}
      />
    </div>
  );
}