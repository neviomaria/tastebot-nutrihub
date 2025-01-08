import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";
import { SearchBar } from "@/components/SearchBar";
import { RecipeCard } from "@/components/RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function FavoriteRecipes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    }
  });

  const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['favorite-recipes', favorites],
    queryFn: async () => {
      if (!favorites?.length) return [];
      
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const allRecipes: Recipe[] = await response.json();
      return allRecipes.filter(recipe => 
        favorites.some(fav => fav.recipe_id === recipe.id)
      );
    },
    enabled: !!favorites
  });

  const filteredRecipes = recipes?.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = isLoadingFavorites || isLoadingRecipes;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-full max-w-xl mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Le Mie Ricette Preferite</h1>
      
      <SearchBar onSearch={setSearchQuery} />

      {filteredRecipes?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            {searchQuery 
              ? "Nessuna ricetta preferita trovata con questi criteri di ricerca" 
              : "Non hai ancora aggiunto ricette ai preferiti"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes?.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              image={recipe.acf.recipe_image?.url || '/placeholder.svg'}
              cookTime={`Prep: ${recipe.acf.prep_time} | Cook: ${recipe.acf.cook_time}`}
              difficulty="Easy"
              recipeId={recipe.id}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}