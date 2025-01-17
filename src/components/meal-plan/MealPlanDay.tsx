import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { RecipeContent } from "@/components/recipe/RecipeContent";
import { RecipeMetadata } from "@/components/recipe/RecipeMetadata";
import { useQuery } from "@tanstack/react-query";

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

  const { data: selectedRecipe } = useQuery({
    queryKey: ['recipe', selectedRecipeId],
    queryFn: async () => {
      if (!selectedRecipeId) return null;
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const recipes = await response.json();
      return recipes.find((r: any) => r.id === selectedRecipeId);
    },
    enabled: !!selectedRecipeId
  });

  const { data: recipeImages } = useQuery({
    queryKey: ['recipe-images'],
    queryFn: async () => {
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const recipes = await response.json();
      return recipes.reduce((acc: Record<number, string>, recipe: any) => {
        if (recipe.acf?.recipe_image?.url) {
          acc[recipe.id] = recipe.acf.recipe_image.url;
        }
        return acc;
      }, {});
    }
  });

  const getRecipeImage = (recipeId: number) => {
    if (!recipeImages) return "/placeholder.svg";
    const imageUrl = recipeImages[recipeId];
    if (!imageUrl) return "/placeholder.svg";
    
    // Get the thumbnail version of the image
    const urlParts = imageUrl.split('.');
    const extension = urlParts.pop();
    return `${urlParts.join('.')}-300x300.${extension}`;
  };

  const formatMealType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-primary px-4 py-2">
        <h2 className="text-lg lg:text-xl font-semibold text-white">Day {dayNumber + 1}</h2>
      </div>
      <div className="p-3 lg:p-6">
        <div className="grid gap-3 lg:gap-6">
          {meals.map((meal, index) => (
            <div 
              key={`${meal.recipe.id}-${index}`}
              className="group cursor-pointer"
              onClick={() => setSelectedRecipeId(meal.recipe.id)}
            >
              <div className="flex items-center gap-3 lg:gap-4 p-2 lg:p-4 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={getRecipeImage(meal.recipe.id)}
                    alt={meal.recipe.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.log('Image failed to load:', meal.recipe.id);
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <span className="text-xs lg:text-sm font-medium text-primary mb-1 block">
                    {formatMealType(meal.meal_type)}
                  </span>
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {meal.recipe.title}
                  </h3>
                  <div className="text-xs lg:text-sm text-muted-foreground mt-1 flex flex-wrap gap-2">
                    <span>Prep: {meal.recipe.prep_time}</span>
                    <span>•</span>
                    <span>Cook: {meal.recipe.cook_time}</span>
                    <span>•</span>
                    <span>Servings: {meal.servings}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <div className="space-y-6">
              <DialogTitle className="text-2xl font-bold">{selectedRecipe.title}</DialogTitle>
              <RecipeMetadata
                prepTime={selectedRecipe.acf.prep_time}
                cookTime={selectedRecipe.acf.cook_time}
                servings={selectedRecipe.acf.servings}
              />
              <RecipeContent
                ingredients={selectedRecipe.acf.ingredients}
                instructions={selectedRecipe.acf.instructions}
                nutritionFacts={selectedRecipe.acf.nutrition_facts}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}