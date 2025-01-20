import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Recipe } from "@/types/recipe";
import { useQuery } from "@tanstack/react-query";
import { FavoriteButton } from "@/components/recipe/FavoriteButton";
import { RecipeMetadata } from "@/components/recipe/RecipeMetadata";
import { RecipeContent } from "@/components/recipe/RecipeContent";
import { Volume2 } from "lucide-react";

interface RecipeDetailsProps {
  recipe: Recipe;
}

export function RecipeDetailsContent({ recipe }: RecipeDetailsProps) {
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
            <a 
              href={recipe.acf.audio_recipe}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 w-9"
            >
              <Volume2 className="h-4 w-4" />
            </a>
          )}
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