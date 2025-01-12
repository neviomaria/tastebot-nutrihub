import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/use-auth-state";
import { RecipeCard } from "@/components/RecipeCard";
import { Recipe } from "@/types/recipe";

const FavoriteRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthState();
  const navigate = useNavigate();

  const { data: wpRecipes } = useQuery({
    queryKey: ['wordpress-recipes'],
    queryFn: async () => {
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch WordPress recipes');
      }
      return response.json() as Promise<Recipe[]>;
    },
    enabled: !!isAuthenticated,
    retry: false
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: favorites, error } = await supabase
          .from('favorites')
          .select('recipe_id')
          .eq('user_id', user.id);

        if (error) throw error;

        if (wpRecipes && favorites) {
          const favoriteRecipes = favorites.map(fav => {
            const recipe = wpRecipes.find(wp => wp.id === fav.recipe_id);
            return recipe;
          }).filter((recipe): recipe is Recipe => !!recipe);

          setRecipes(favoriteRecipes);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (wpRecipes && isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, wpRecipes]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Favorite Recipes</h1>
        <div className="text-center">Loading your favorite recipes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Favorite Recipes</h1>
      {recipes.length === 0 ? (
        <div className="text-center text-gray-600">
          You haven't added any recipes to your favorites yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              image={recipe.acf.recipe_image?.url || '/placeholder.svg'}
              cookTime={`Prep: ${recipe.acf.prep_time} | Cook: ${recipe.acf.cook_time}`}
              difficulty={recipe.acf.pasto || 'Easy'}
              recipeId={recipe.id}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteRecipes;