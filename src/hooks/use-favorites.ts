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