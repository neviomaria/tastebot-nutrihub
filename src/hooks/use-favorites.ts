import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth-state";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setIsLoadingFavorites(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      setFavorites(data.map(f => f.recipe_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const toggleFavorite = useCallback(async (recipeId: number) => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }

    try {
      setIsLoadingFavorites(true);

      if (!user) throw new Error("User not authenticated");

      // First, ensure the recipe exists in our database
      const { data: existingRecipe, error: queryError } = await supabase
        .from('recipes')
        .select('id')
        .eq('id', recipeId)
        .maybeSingle();

      if (queryError) throw queryError;

      if (!existingRecipe) {
        // If recipe doesn't exist, fetch it from WordPress and create it
        try {
          const response = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/recipe/${recipeId}`);
          if (!response.ok) throw new Error('Failed to fetch recipe from WordPress');
          
          const wpRecipe = await response.json();
          
          const { error: insertError } = await supabase
            .from('recipes')
            .insert({
              id: recipeId,
              title: wpRecipe.title.rendered,
              description: wpRecipe.content.rendered,
              ingredients: wpRecipe.acf.ingredients || [],
              instructions: wpRecipe.acf.instructions || [],
              prep_time: wpRecipe.acf.prep_time,
              cook_time: wpRecipe.acf.cook_time,
              servings: wpRecipe.acf.servings,
              meal_type: wpRecipe.acf.meal_type,
            });

          if (insertError) throw insertError;
        } catch (error) {
          console.error('Error creating recipe:', error);
          throw new Error('Failed to create recipe in database');
        }
      }

      if (favorites.includes(recipeId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== recipeId));
        toast.success("Recipe removed from favorites", {
          style: { background: '#F2FCE2', borderColor: '#86efac' },
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, recipe_id: recipeId });

        if (error) throw error;

        setFavorites(prev => [...prev, recipeId]);
        toast.success("Recipe added to favorites", {
          style: { background: '#F2FCE2', borderColor: '#86efac' },
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error("Failed to update favorites");
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [favorites, user]);

  return { favorites, isLoadingFavorites, toggleFavorite };
}