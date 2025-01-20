import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Recipe } from "@/types/recipe";
import { useQuery } from "@tanstack/react-query";
import { FavoriteButton } from "@/components/recipe/FavoriteButton";
import { RecipeMetadata } from "@/components/recipe/RecipeMetadata";
import { RecipeContent } from "@/components/recipe/RecipeContent";
import { AudioLines, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecipeDetailsProps {
  recipe: Recipe;
}

export function RecipeDetailsContent({ recipe }: RecipeDetailsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(recipe.acf.audio_recipe));

  const handlePlayAudio = () => {
    if (!recipe.acf.audio_recipe) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

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
        <div className="flex gap-2 items-center">
          {recipe.acf.audio_recipe && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayAudio}
              className="h-9 w-9 p-0 hover:bg-transparent"
            >
              <AudioLines className={`h-4 w-4 ${
                isPlaying 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`} />
              <span className="sr-only">
                {isPlaying ? 'Stop audio' : 'Play audio'}
              </span>
            </Button>
          )}
          <FavoriteButton 
            recipeId={recipe.id} 
            size="default" 
            variant="ghost" 
          />
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