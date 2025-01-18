import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { RecipeContent } from "@/components/recipe/RecipeContent";
import { RecipeMetadata } from "@/components/recipe/RecipeMetadata";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface MealPlanDayProps {
  dayNumber: number;
  meals: Array<{
    meal_type: string;
    recipe: {
      id: number;
      title: string;
      prep_time: string;
      cook_time: string;
      servings: number;
    };
    servings: number;
  }>;
}

export function MealPlanDay({ dayNumber, meals }: MealPlanDayProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  // First get the WordPress auth token
  const { data: wpToken } = useQuery({
    queryKey: ["wp-auth"],
    queryFn: async () => {
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: process.env.WORDPRESS_USERNAME,
          password: process.env.WORDPRESS_PASSWORD,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to authenticate with WordPress');
      }
      const data = await response.json();
      return data.token;
    },
  });

  // Fetch all recipes once
  const { data: recipes, isLoading: isLoadingRecipes, isError: isErrorRecipes } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const response = await fetch("https://brainscapebooks.com/wp-json/custom/v1/recipes");
      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }
      return response.json();
    },
  });

  // Precompute recipes map for efficient lookup
  const recipeMap = useMemo(() => {
    return recipes?.reduce((acc: Record<number, any>, recipe: any) => {
      acc[recipe.id] = recipe;
      return acc;
    }, {});
  }, [recipes]);

  const selectedRecipe = selectedRecipeId ? recipeMap?.[selectedRecipeId] : null;

  // Fetch media details when a recipe is selected, now with authentication
  const { data: mediaDetails, isLoading: isLoadingMedia } = useQuery({
    queryKey: ["media", selectedRecipe?.acf?.recipe_image?.ID, wpToken],
    queryFn: async () => {
      if (!selectedRecipe?.acf?.recipe_image?.ID || !wpToken) return null;
      
      const response = await fetch(
        `https://brainscapebooks.com/wp-json/wp/v2/media/${selectedRecipe.acf.recipe_image.ID}`,
        {
          headers: {
            'Authorization': wpToken
          }
        }
      );
      
      if (!response.ok) {
        console.error('Media fetch error:', await response.text());
        return null;
      }
      
      return response.json();
    },
    enabled: !!selectedRecipe?.acf?.recipe_image?.ID && !!wpToken,
  });

  const getRecipeImageUrl = (recipe: any) => {
    // First check if we have a recipe with image data
    if (!recipe?.acf?.recipe_image?.ID) {
      console.log('No recipe image ID found for recipe:', recipe?.id);
      return "/placeholder.svg";
    }

    // If this is the selected recipe and we have media details
    if (selectedRecipe?.id === recipe.id && mediaDetails?.media_details?.sizes?.["recipe-app"]?.source_url) {
      console.log('Found recipe-app URL for recipe:', recipe.id);
      return mediaDetails.media_details.sizes["recipe-app"].source_url;
    }

    // If we don't have media details yet or it's not the selected recipe, return the default image URL
    return recipe.acf.recipe_image.url || "/placeholder.svg";
  };

  const formatMealType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="bg-primary px-6 py-3">
        <h2 className="text-xl font-semibold text-white">Day {dayNumber + 1}</h2>
      </div>
      <div className="p-4 md:p-6">
        {isLoadingRecipes ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isErrorRecipes ? (
          <p className="text-red-500">Failed to load recipes. Please try again later.</p>
        ) : (
          <div className="grid gap-4">
            {meals.map((meal, index) => (
              <div
                key={`${meal.recipe.id}-${index}`}
                className="group cursor-pointer"
                onClick={() => setSelectedRecipeId(meal.recipe.id)}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-lg hover:bg-secondary transition-colors">
                  <div className="w-full md:w-24 h-48 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getRecipeImageUrl(recipeMap?.[meal.recipe.id])}
                      alt={meal.recipe.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', e.currentTarget.src);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-grow w-full md:w-auto">
                    <span className="text-sm font-medium text-primary mb-1 block">
                      {formatMealType(meal.meal_type)}
                    </span>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {meal.recipe.title}
                    </h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span>Prep: {meal.recipe.prep_time}</span>
                      <span className="mx-2">•</span>
                      <span>Cook: {meal.recipe.cook_time}</span>
                      <span className="mx-2">•</span>
                      <span>Servings: {meal.servings}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedRecipeId} onOpenChange={() => setSelectedRecipeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {(isLoadingRecipes || (selectedRecipeId && isLoadingMedia)) ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedRecipe ? (
            <div className="space-y-6">
              <DialogTitle className="text-2xl font-bold">{selectedRecipe.title}</DialogTitle>
              <RecipeMetadata
                prepTime={selectedRecipe.acf?.prep_time || "N/A"}
                cookTime={selectedRecipe.acf?.cook_time || "N/A"}
                servings={selectedRecipe.acf?.servings || "N/A"}
              />
              <RecipeContent
                ingredients={selectedRecipe.acf?.ingredients || []}
                instructions={selectedRecipe.acf?.instructions || []}
                nutritionFacts={selectedRecipe.acf?.nutrition_facts}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}