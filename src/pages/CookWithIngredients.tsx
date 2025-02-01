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
import { Form } from "@/components/ui/form";
import { Search, X } from "lucide-react";

export default function CookWithIngredients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ingredientFilter, setIngredientFilter] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const form = useForm({
    defaultValues: {
      ingredients: []
    }
  });
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

  const cleanIngredientString = (ingredient: string) => {
    // First remove colons and everything before them
    let cleaned = ingredient.replace(/^[^:]*:\s*/, '');
    
    // Then apply other cleaning steps
    return cleaned
      .replace(/^[\d./\s-]+/, '') // Remove numbers, fractions, and dashes at start
      .replace(/\([^)]*\)/g, '') // Remove anything in parentheses
      .replace(/\b\d+\/?\d*\s*(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|lbs|ounce|ounces|oz|gram|grams|g|ml|l|can|cans|piece|pieces|slice|slices)\b\s*/gi, '')
      .replace(/\b(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|lbs|ounce|ounces|oz|gram|grams|g|ml|l|can|cans|piece|pieces|slice|slices|drained|rinsed|mashed|flaked|crushed|optional)\b\s*/gi, '')
      .replace(/,/g, '') // Remove commas
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/^(of|the|a|an)\s+/i, '') // Remove leading articles
      .replace(/\s+(of|the|a|an)\s+/gi, ' ') // Remove articles in the middle
      .replace(/^(small|medium|large)\s+/i, '') // Remove size indicators
      .replace(/\s+(small|medium|large)\s+/gi, ' ') // Remove size indicators in the middle
      .replace(/for garnish/gi, '') // Remove "for garnish"
      .replace(/to taste/gi, '') // Remove "to taste"
      .trim()
      .toLowerCase();
  };

  const getMatchingRecipes = () => {
    if (!recipes || !hasSearched) return { perfect: [], close: [] };

    const selectedIngredients = form.watch("ingredients") || [];

    // First filter by search query if present
    const searchFiltered = searchQuery
      ? recipes.filter((recipe: Recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : recipes;

    // If no ingredients selected, return all search-filtered recipes as "perfect" matches
    if (!selectedIngredients.length) {
      return { perfect: searchFiltered, close: [] };
    }

    // Then filter by ingredients
    const matchingRecipes = searchFiltered.filter((recipe: Recipe) => {
      const recipeIngredients = (recipe.acf?.ingredients || []).map(i => 
        cleanIngredientString(i.ingredient_item)
      );

      return recipeIngredients.some(ingredient =>
        selectedIngredients.some(selected =>
          ingredient.includes(selected.toLowerCase())
        )
      );
    });

    return matchingRecipes.reduce((acc: { perfect: Recipe[], close: Recipe[] }, recipe: Recipe) => {
      const recipeIngredients = (recipe.acf?.ingredients || []).map(i => 
        cleanIngredientString(i.ingredient_item)
      );

      const hasAllIngredients = selectedIngredients.every(selected =>
        recipeIngredients.some(ingredient =>
          ingredient.includes(selected.toLowerCase())
        )
      );

      if (hasAllIngredients) {
        acc.perfect.push(recipe);
      } else {
        const matchingIngredientsCount = selectedIngredients.filter(selected =>
          recipeIngredients.some(ingredient =>
            ingredient.includes(selected.toLowerCase())
          )
        ).length;

        if (matchingIngredientsCount > 0) {
          acc.close.push(recipe);
        }
      }

      return acc;
    }, { perfect: [], close: [] });
  };

  const allIngredients = recipes
    ? Array.from(
        new Set(
          recipes.flatMap((recipe: Recipe) =>
            (recipe.acf?.ingredients || []).map(i => cleanIngredientString(i.ingredient_item))
          )
        )
      ).sort() as readonly string[]
    : ([] as readonly string[]);

  const selectedIngredients = form.watch("ingredients") || [];
  const { perfect: perfectMatches, close: closeMatches } = getMatchingRecipes();

  const handleSearch = () => {
    const currentIngredients = form.getValues("ingredients");
    console.log('Searching with ingredients:', currentIngredients);
    setHasSearched(true);
  };

  const clearFilters = () => {
    form.reset({ ingredients: [] });
    setSearchQuery("");
    setIngredientFilter("");
    setHasSearched(false);
  };

  const filteredIngredients = allIngredients.filter(ingredient => 
    ingredient.toLowerCase().includes(ingredientFilter.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cook with Your Ingredients</h1>

      <div className="grid gap-6 md:grid-cols-[300px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Available Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Form {...form}>
              <div className="space-y-4">
                <SelectField
                  form={form}
                  name="ingredients"
                  label="Select ingredients"
                  options={filteredIngredients}
                  multiple={true}
                  searchValue={ingredientFilter}
                  onSearchChange={setIngredientFilter}
                />
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={handleSearch}
                    type="button"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    type="button"
                    className="px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                Loading recipes...
              </CardContent>
            </Card>
          ) : (
            <>
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
                  {!hasSearched ? (
                    <p className="text-muted-foreground">
                      Search for recipes or select ingredients to get started
                    </p>
                  ) : perfectMatches.length > 0 ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {!hasSearched ? (
                    <p className="text-muted-foreground">
                      Search for recipes or select ingredients to get started
                    </p>
                  ) : closeMatches.length > 0 ? (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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