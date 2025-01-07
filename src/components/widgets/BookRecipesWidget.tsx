import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Utensils } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RecipeCard } from "@/components/RecipeCard";

interface Recipe {
  id: number;
  title: string;
  acf: {
    prep_time: string;
    cook_time: string;
    recipe_image: {
      url: string;
      sizes: {
        'recipe-app': string;
      };
    };
  };
}

export function BookRecipesWidget() {
  const navigate = useNavigate();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['book-recipes'],
    queryFn: async () => {
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data: Recipe[] = await response.json();
      return data.slice(0, 5); // Get first 5 recipes for the carousel
    }
  });

  const getRecipeImage = (recipe: Recipe) => {
    if (!recipe.acf.recipe_image) return '/placeholder.svg';
    return recipe.acf.recipe_image.url;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Featured Recipes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 animate-pulse bg-gray-100 rounded-lg" />
        ) : recipes && recipes.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {recipes.map((recipe) => (
                <CarouselItem key={recipe.id} className="md:basis-1/2 lg:basis-1/3">
                  <RecipeCard
                    title={recipe.title}
                    image={getRecipeImage(recipe)}
                    cookTime={`Prep: ${recipe.acf.prep_time} | Cook: ${recipe.acf.cook_time}`}
                    difficulty="Easy"
                    recipeId={recipe.id}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        ) : (
          <p className="text-muted-foreground">No recipes available</p>
        )}
      </CardContent>
    </Card>
  );
}