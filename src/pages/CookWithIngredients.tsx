import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/SearchBar";
import { RecipeCard } from "@/components/RecipeCard";
import { useNavigate } from "react-router-dom";

interface Recipe {
  id: number;
  title: string;
  acf: {
    prep_time: string;
    cook_time: string;
    recipe_image: {
      url: string;
    };
    ingredients: Array<{
      ingredient_item: string;
    }>;
  };
}

export default function CookWithIngredients() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<{ keywords: string; ingredients: string[] }>({
    keywords: "",
    ingredients: [],
  });

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      return response.json();
    },
  });

  const allIngredients: string[] = recipes
    ? Array.from(
        new Set(
          recipes.flatMap((recipe: Recipe) =>
            recipe.acf.ingredients.map((ing) => ing.ingredient_item)
          )
        )
      )
    : [];

  const filteredRecipes = recipes?.filter((recipe: Recipe) => {
    const matchesKeywords = searchParams.keywords
      ? recipe.title.toLowerCase().includes(searchParams.keywords.toLowerCase())
      : true;

    const matchesIngredients = searchParams.ingredients.length
      ? searchParams.ingredients.every((ingredient) =>
          recipe.acf.ingredients.some((ing) =>
            ing.ingredient_item.toLowerCase().includes(ingredient.toLowerCase())
          )
        )
      : true;

    return matchesKeywords && matchesIngredients;
  });

  const handleSearch = (query: { keywords: string; ingredients: string[] }) => {
    setSearchParams(query);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Cook with What You Have</h1>
        <p className="text-muted-foreground">
          Select the ingredients you have, and we'll show you recipes you can make!
        </p>

        <SearchBar onSearch={handleSearch} ingredients={allIngredients} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRecipes?.map((recipe: Recipe) => (
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

        {filteredRecipes?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No recipes found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}