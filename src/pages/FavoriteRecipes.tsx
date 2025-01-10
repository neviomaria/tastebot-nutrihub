import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/use-auth-state";
import { RecipeCard } from "@/components/RecipeCard";

interface WordPressRecipe {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_media_url?: string;
  acf: {
    prep_time?: string;
    cook_time?: string;
    total_time?: string;
    servings?: number;
    difficulty?: string;
  };
}

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  prep_time?: string;
  cook_time?: string;
  total_time?: string;
  servings?: number;
  difficulty?: string;
}

const FavoriteRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthState();
  const navigate = useNavigate();

  const { data: wpRecipes } = useQuery({
    queryKey: ['wordpress-recipes'],
    queryFn: async () => {
      const response = await fetch('https://brainscapebooks.com/wp-json/wp/v2/recipes?per_page=100');
      if (!response.ok) {
        throw new Error('Failed to fetch WordPress recipes');
      }
      return response.json() as Promise<WordPressRecipe[]>;
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
          .select(`
            recipe_id,
            recipes (
              id,
              title,
              description
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        // Transform and merge data with WordPress recipes
        const mergedRecipes = favorites?.map(fav => {
          const wpRecipe = wpRecipes?.find(wp => wp.id === fav.recipe_id);
          return {
            id: fav.recipes.id,
            title: fav.recipes.title,
            description: fav.recipes.description,
            image_url: wpRecipe?.featured_media_url || '/placeholder.svg',
            prep_time: wpRecipe?.acf?.prep_time || 'N/A',
            cook_time: wpRecipe?.acf?.cook_time || 'N/A',
            difficulty: wpRecipe?.acf?.difficulty || 'Easy',
            servings: wpRecipe?.acf?.servings
          };
        }) || [];

        setRecipes(mergedRecipes);
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
              image={recipe.image_url || '/placeholder.svg'}
              cookTime={`Prep: ${recipe.prep_time} | Cook: ${recipe.cook_time}`}
              difficulty={recipe.difficulty || 'Easy'}
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