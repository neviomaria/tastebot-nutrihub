import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RecipeCard from '@/components/RecipeCard';
import { useToast } from '@/components/ui/use-toast';

const Favorites = () => {
  const { toast } = useToast();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data: favoritesData, error } = await supabase
        .from('favorites')
        .select(`
          recipe_id,
          recipes (
            id,
            title,
            description,
            prep_time,
            cook_time,
            meal_type
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load favorites",
        });
        throw error;
      }

      return favoritesData;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Favorite Recipes</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Favorite Recipes</h1>
      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <RecipeCard
              key={favorite.recipe_id}
              recipe={favorite.recipes}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">You haven't added any favorites yet.</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;