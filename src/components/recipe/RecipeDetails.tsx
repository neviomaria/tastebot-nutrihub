import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Recipe } from "@/types/recipe";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { FavoriteButton } from "@/components/recipe/FavoriteButton";
import { RecipeMetadata } from "@/components/recipe/RecipeMetadata";
import { RecipeContent } from "@/components/recipe/RecipeContent";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

interface RecipeDetailsProps {
  recipe: Recipe;
}

export function RecipeDetailsContent({ recipe }: RecipeDetailsProps) {
  const { generateSpeech, isLoading, cleanup } = useTextToSpeech();
  const { toast } = useToast();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const formatRecipeText = () => {
    const sections = [];
    
    // Add title
    sections.push(`Recipe for ${recipe.title}.`);
    
    // Add description if exists
    if (recipe.content) {
      sections.push(recipe.content.replace(/<[^>]*>/g, ''));
    }
    
    // Add ingredients
    if (recipe.acf.ingredients?.length > 0) {
      sections.push("Ingredients needed:");
      recipe.acf.ingredients.forEach(i => {
        sections.push(i.ingredient_item);
      });
    }
    
    // Add instructions
    if (recipe.acf.instructions?.length > 0) {
      sections.push("Instructions:");
      recipe.acf.instructions.forEach((i, index) => {
        sections.push(`Step ${index + 1}: ${i.instructions_step}`);
      });
    }
    
    return sections.join(' ');
  };

  const handlePlayRecipe = async () => {
    try {
      const textToRead = formatRecipeText();
      if (textToRead.length > 4096) {
        toast({
          title: "Text too long",
          description: "The recipe text is too long to be converted to speech. Please try a shorter recipe.",
          variant: "destructive",
        });
        return;
      }
      
      await generateSpeech(textToRead);
    } catch (error) {
      console.error('Error playing recipe:', error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    }
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

// Rename the exported component to avoid naming conflict
export { RecipeDetailsContent as RecipeDetails };