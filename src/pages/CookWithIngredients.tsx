import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/form/SelectField";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { RecipeCard } from "@/components/RecipeCard";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recipe } from "@/types/recipe";

export default function CookWithIngredients() {
  const [searchQuery, setSearchQuery] = useState("");
  const form = useForm();
  const navigate = useNavigate();

  const { data: userBooks } = useQuery({
    queryKey: ['userBooks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('book_id')
        .eq('id', user.id)
        .single();

      const { data: coupons } = await supabase
        .from('user_coupons')
        .select('book_id')
        .eq('user_id', user.id);

      const bookIds = new Set([
        profile?.book_id,
        ...(coupons?.map(c => c.book_id) || [])
      ].filter(Boolean));

      return Array.from(bookIds);
    }
  });

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes', userBooks],
    queryFn: async () => {
      if (!userBooks?.length) return [];
      
      const response = await fetch(
        "https://brainscapebooks.com/wp-json/custom/v1/recipes"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }
      const allRecipes = await response.json();
      
      return allRecipes.filter((recipe: Recipe) => 
        recipe.acf.libro_associato?.some((book) => 
          userBooks.includes(book.ID.toString())
        )
      );
    },
    enabled: !!userBooks?.length
  });

  const selectedIngredients = form.watch("ingredients") || [];

  const getMatchingRecipes = () => {
    if (!recipes) return { perfect: [], close: [] };

    const matchingRecipes = recipes.filter((recipe: Recipe) => {
      const matchesSearch = recipe.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const recipeIngredients = recipe.acf.ingredients.map(i => 
        i.ingredient_item.toLowerCase()
      );

      return recipeIngredients.some(ingredient =>
        selectedIngredients.some(selected =>
          ingredient.includes(selected.toLowerCase())
        )
      );
    });

    return matchingRecipes.reduce((acc: { perfect: Recipe[], close: Recipe[] }, recipe: Recipe) => {
      const recipeIngredients = recipe.acf.ingredients.map(i => 
        i.ingredient_item.toLowerCase()
      );

      const hasAllIngredients = selectedIngredients.length > 0 && recipeIngredients.every(ingredient =>
        selectedIngredients.some(selected =>
          ingredient.includes(selected.toLowerCase())
        )
      );

      if (hasAllIngredients) {
        acc.perfect.push(recipe);
      } else {
        const missingCount = recipeIngredients.filter(ingredient =>
          !selectedIngredients.some(selected =>
            ingredient.includes(selected.toLowerCase())
          )
        ).length;

        if (missingCount <= 3) {
          acc.close.push(recipe);
        }
      }

      return acc;
    }, { perfect: [], close: [] });
  };

  const allIngredients: readonly string[] = recipes
    ? Array.from(
        new Set(
          recipes.flatMap((recipe: Recipe) =>
            recipe.acf.ingredients.map(i => i.ingredient_item.trim())
          )
        )
      ).sort()
    : [];

  const { perfect: perfectMatches, close: closeMatches } = getMatchingRecipes();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cook with Your Ingredients</h1>

      <div className="grid gap-6 md:grid-cols-[300px,1fr]">
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Available Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <SelectField
                form={form}
                name="ingredients"
                label="Select or type ingredients"
                options={allIngredients}
                multiple={true}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                form.reset();
              }}
            >
              Clear All
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                Loading recipes...
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Perfect Matches */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Ready to Cook
                    <Badge variant="default" className="ml-2">
                      {perfectMatches.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {perfectMatches.length > 0 ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid gap-4">
                        {perfectMatches.map((recipe: Recipe) => (
                          <RecipeCard
                            key={recipe.id}
                            title={recipe.title}
                            image={recipe.acf.recipe_image?.url}
                            cookTime={`Prep: ${recipe.acf.prep_time} | Cook: ${recipe.acf.cook_time}`}
                            difficulty="Easy"
                            recipeId={recipe.id}
                            onClick={() => navigate(`/recipe/${recipe.id}`)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-muted-foreground">
                      No recipes found that match all your ingredients
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Close Matches */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Almost There
                    <Badge variant="secondary" className="ml-2">
                      {closeMatches.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {closeMatches.length > 0 ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid gap-4">
                        {closeMatches.map((recipe: Recipe) => (
                          <RecipeCard
                            key={recipe.id}
                            title={recipe.title}
                            image={recipe.acf.recipe_image?.url}
                            cookTime={`Prep: ${recipe.acf.prep_time} | Cook: ${recipe.acf.cook_time}`}
                            difficulty="Easy"
                            recipeId={recipe.id}
                            onClick={() => navigate(`/recipe/${recipe.id}`)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-muted-foreground">
                      No recipes found that are close to your ingredients
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
