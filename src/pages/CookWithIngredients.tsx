import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/form/SelectField";

interface Recipe {
  id: number;
  title: string;
  ingredients: string[];
  acf: {
    prep_time: string;
    cook_time: string;
    ingredients: string[];
    instructions: string[];
    recipe_image: {
      url: string;
      sizes: {
        'recipe-app': string;
        medium: string;
      };
    };
  };
}

export default function CookWithIngredients() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const response = await fetch(
        "https://brainscapebooks.com/wp-json/custom/v1/recipes"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }
      return response.json();
    },
  });

  const allIngredients: string[] = recipes
    ? Array.from(
        new Set(
          recipes.flatMap((recipe: Recipe) =>
            recipe.acf.ingredients.map((ingredient) => ingredient.trim())
          )
        )
      ).sort()
    : [];

  const filteredRecipes = recipes?.filter((recipe: Recipe) => {
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const hasSelectedIngredients =
      selectedIngredients.length === 0 ||
      selectedIngredients.every((ingredient) =>
        recipe.acf.ingredients.some((recipeIngredient) =>
          recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
        )
      );

    return matchesSearch && hasSelectedIngredients;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cook with Your Ingredients</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <SelectField
                label="Select Ingredients"
                options={allIngredients.map((ingredient) => ({
                  label: ingredient,
                  value: ingredient,
                }))}
                value={selectedIngredients}
                onChange={setSelectedIngredients}
                isMulti
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedIngredients([]);
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              Found Recipes ({filteredRecipes?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading recipes...</div>
            ) : filteredRecipes?.length ? (
              <ul className="space-y-2">
                {filteredRecipes.map((recipe: Recipe) => (
                  <li key={recipe.id} className="p-2 hover:bg-gray-50 rounded">
                    {recipe.title}
                  </li>
                ))}
              </ul>
            ) : (
              <div>No recipes found matching your criteria</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}