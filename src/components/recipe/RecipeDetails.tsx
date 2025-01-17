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
        <div className="flex gap-2">
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