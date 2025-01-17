import { Recipe } from "@/types/recipe";
import { RecipeMetadata } from "./RecipeMetadata";
import { RecipeContent } from "./RecipeContent";
import { FavoriteButton } from "./FavoriteButton";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface RecipeDetailsProps {
  recipe: Recipe;
}

export function RecipeDetails({ recipe }: RecipeDetailsProps) {
  const { generateSpeech, isLoading, cleanup } = useTextToSpeech();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const handlePlayRecipe = async () => {
    const textToRead = `Recipe for ${recipe.title}. 
      ${recipe.content}
      Ingredients needed: ${recipe.acf.ingredients.map(i => i.ingredient_item).join(", ")}. 
      Instructions: ${recipe.acf.instructions.map(i => i.instructions_step).join(". ")}`;
    
    await generateSpeech(textToRead);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <div 
            className="text-gray-600" 
            dangerouslySetInnerHTML={{ __html: recipe.content }} 
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlayRecipe}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <FavoriteButton recipeId={recipe.id} size="default" variant="default" />
        </div>
      </div>

      <RecipeMetadata
        prepTime={recipe.acf.prep_time}
        cookTime={recipe.acf.cook_time}
        servings={recipe.acf.servings}
      />

      <RecipeContent
        ingredients={recipe.acf.ingredients || []}
        instructions={recipe.acf.instructions || []}
        nutritionFacts={recipe.acf.nutrition_facts || []}
      />
    </div>
  );
}