import { useQuery } from "@tanstack/react-query";
import { Recipe } from "@/types/recipe";

export function useBookRecipes(id: string) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: async () => {
      try {
        const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const recipes: Recipe[] = await response.json();
        return recipes.filter((recipe) => 
          recipe.acf.libro_associato?.some((book) => book.ID.toString() === id)
        );
      } catch (error) {
        console.error("Error fetching recipes:", error);
        throw error;
      }
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}