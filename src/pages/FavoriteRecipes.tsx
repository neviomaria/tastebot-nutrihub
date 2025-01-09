import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RecipeCard } from "@/components/RecipeCard";
import { useAuthState } from "@/hooks/use-auth-state";
import { Loader2 } from "lucide-react";

interface FavoriteRecipe {
  id: number;
  title: string;
  prep_time: string;
  cook_time: string;
  recipe_image?: {
    url: string;
  };
}

const FavoriteRecipes = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: favorites, error } = await supabase
          .from('favorites')
          .select(`
            recipe_id,
            recipes (
              id,
              title,
              prep_time,
              cook_time
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        // Transform the data to match the FavoriteRecipe interface
        const recipes = favorites?.map(fav => ({
          id: fav.recipes.id,
          title: fav.recipes.title,
          prep_time: fav.recipes.prep_time || "N/A",
          cook_time: fav.recipes.cook_time || "N/A",
        })) || [];

        setFavoriteRecipes(recipes);
      } catch (error) {
        console.error('Error fetching favorite recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteRecipes();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen animate-fade-up space-y-8 bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            My Favorite Recipes
          </h1>
          <p className="text-muted-foreground">
            Please sign in to view your favorite recipes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-up space-y-8 bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          My Favorite Recipes
        </h1>
        {favoriteRecipes.length === 0 ? (
          <p className="text-muted-foreground">
            You haven't added any recipes to your favorites yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                image={recipe.recipe_image?.url || "/placeholder.svg"}
                cookTime={recipe.cook_time}
                difficulty="N/A"
                recipeId={recipe.id}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteRecipes;