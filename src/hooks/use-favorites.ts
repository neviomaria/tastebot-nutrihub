import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_id');

      if (error) throw error;
      return data.map(f => f.recipe_id);
    }
  });

  const { mutate: toggleFavorite } = useMutation({
    mutationFn: async (recipeId: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First, ensure the recipe exists in our database
      const { data: existingRecipe } = await supabase
        .from('recipes')
        .select('id')
        .eq('id', recipeId)
        .single();

      if (!existingRecipe) {
        // If recipe doesn't exist, fetch it from WordPress and create it
        const response = await fetch(`https://brainscapebooks.com/wp-json/custom/v1/recipes`);
        if (!response.ok) throw new Error('Failed to fetch recipes');
        const recipes = await response.json();
        const recipe = recipes.find((r: any) => r.id === recipeId);
        
        if (!recipe) throw new Error('Recipe not found');

        // Insert the recipe into our database
        const { error: insertError } = await supabase
          .from('recipes')
          .insert({
            id: recipe.id,
            title: recipe.title,
            description: recipe.content,
            ingredients: recipe.acf.ingredients?.map((i: any) => i.ingredient_item) || [],
            instructions: recipe.acf.instructions?.map((i: any) => i.instructions_step) || [],
            prep_time: recipe.acf.prep_time,
            cook_time: recipe.acf.cook_time,
            servings: parseInt(recipe.acf.servings) || null,
            meal_type: recipe.acf.pasto,
            user_id: user.id
          });

        if (insertError) throw insertError;
      }

      const isFavorited = favorites?.includes(recipeId);

      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, recipe_id: recipeId });

        if (error) throw error;
      }
    },
    onSuccess: (_, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      const isFavorited = favorites?.includes(recipeId);
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Recipe removed from your favorites" : "Recipe added to your favorites",
      });
    },
    meta: {
      errorHandler: (error: Error) => {
        console.error('Error toggling favorite:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update favorites. Please try again.",
        });
      }
    }
  });

  return {
    favorites: favorites || [],
    isLoadingFavorites,
    toggleFavorite,
  };
}