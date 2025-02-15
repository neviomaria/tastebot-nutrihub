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
    audio_recipe?: string;
    recipe_image: {
      url: string;
      sizes: {
        'recipe-app': string;
        medium: string;
      };
    };
  };
}

export function BookRecipesWidget() {
  console.log("[BookRecipesWidget] Starting render");
  const navigate = useNavigate();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['book-recipes'],
    queryFn: async () => {
      console.log("[BookRecipesWidget] Fetching recipes");
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data: Recipe[] = await response.json();
      console.log("[BookRecipesWidget] Recipes fetched:", data);
      return data.slice(0, 5); // Get first 5 recipes for the carousel
    }
  });

  const getRecipeImage = (recipe: Recipe) => {
    console.log("[BookRecipesWidget] Getting image for recipe:", recipe.title);
    if (!recipe.acf?.recipe_image) {
      console.log("[BookRecipesWidget] No recipe image found, using placeholder");
      return '/placeholder.svg';
    }
    
    // Try to get the recipe-app size first, then medium size, then fall back to full URL
    const imageUrl = recipe.acf.recipe_image.sizes?.['recipe-app'] || 
                    recipe.acf.recipe_image.sizes?.['medium'] || 
                    recipe.acf.recipe_image.url;
    
    console.log("[BookRecipesWidget] Using image URL:", imageUrl);
    return imageUrl;
  };

  console.log("[BookRecipesWidget] Current recipes data:", recipes?.length || 0);

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
                    audio_recipe={recipe.acf.audio_recipe}
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
