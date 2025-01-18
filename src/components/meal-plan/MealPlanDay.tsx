import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
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

  const { data: selectedRecipe, isLoading: isLoadingRecipe } = useQuery({
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

  const formatMealType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="bg-primary px-6 py-3">
        <h2 className="text-xl font-semibold text-white">Day {dayNumber + 1}</h2>
      </div>
      <div className="p-6">
        <div className="grid gap-4">
          {meals.map((meal, index) => (
            <div 
              key={`${meal.recipe.id}-${index}`}
              className="group cursor-pointer"
              onClick={() => setSelectedRecipeId(meal.recipe.id)}
            >
              <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={`https://brainscapebooks.com/wp-content/uploads/recipes/${meal.recipe.id}-recipe-app.jpg`}
                    alt={meal.recipe.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.log('Image failed to load, using placeholder');
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="flex-grow">
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
      </div>

      <Dialog open={!!selectedRecipeId} onOpenChange={() => setSelectedRecipeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {isLoadingRecipe ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedRecipe ? (
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
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}