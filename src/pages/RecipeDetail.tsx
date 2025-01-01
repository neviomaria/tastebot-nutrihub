import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Recipe {
  id: number;
  title: string;
  content: string;
  acf: {
    prep_time: string;
    cook_time: string;
    pasto: string;
    recipe_image: {
      url: string;
    };
  };
}

const RecipeDetail = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextRecipe, setNextRecipe] = useState<Recipe | null>(null);
  const [prevRecipe, setPrevRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      try {
        // Fetch current recipe
        const response = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/recipes/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const recipeData = await response.json();
        setRecipe(recipeData);

        // Fetch all recipes to determine next and previous
        const allRecipesResponse = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
        if (!allRecipesResponse.ok) {
          throw new Error(`HTTP error! status: ${allRecipesResponse.status}`);
        }
        const allRecipes = await allRecipesResponse.json();
        
        const currentIndex = allRecipes.findIndex((r: Recipe) => r.id === parseInt(id!));
        
        if (currentIndex > 0) {
          setPrevRecipe(allRecipes[currentIndex - 1]);
        } else {
          setPrevRecipe(null);
        }

        if (currentIndex < allRecipes.length - 1) {
          setNextRecipe(allRecipes[currentIndex + 1]);
        } else {
          setNextRecipe(null);
        }

      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast({
          title: "Error",
          description: "Failed to load recipe details",
          variant: "destructive",
        });
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipeDetails();
    }
  }, [id, toast]); // Added id to dependencies to refetch when it changes

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 w-1/2 bg-gray-200 rounded mb-8"></div>
                <div className="aspect-video w-full bg-gray-200 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe not found</h1>
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  const handleNavigation = (recipeId: number) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
          <div className="text-sm text-muted-foreground">
            {recipe.acf.pasto}
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
            
            <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
              <div>Prep time: {recipe.acf.prep_time}</div>
              <div>Cook time: {recipe.acf.cook_time}</div>
            </div>

            {recipe.acf.recipe_image?.url && (
              <img
                src={recipe.acf.recipe_image.url}
                alt={recipe.title}
                className="w-full rounded-lg mb-6"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            )}

            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: recipe.content }}
            />
          </CardContent>
        </Card>

        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              {prevRecipe && (
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handleNavigation(prevRecipe.id)}
                  />
                </PaginationItem>
              )}
              
              {nextRecipe && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handleNavigation(nextRecipe.id)}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;