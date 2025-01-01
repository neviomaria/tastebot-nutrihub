import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  mealType: string;
}

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevRecipe, setPrevRecipe] = useState<Recipe | null>(null);
  const [nextRecipe, setNextRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        
        // First check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          navigate("/auth");
          return;
        }

        // Fetch recipe details
        const { data: recipeData, error: recipeError } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .single();

        if (recipeError) {
          throw recipeError;
        }

        if (!recipeData) {
          throw new Error("Recipe not found");
        }

        setRecipe(recipeData);

        // Fetch previous recipe
        const { data: prevData } = await supabase
          .from("recipes")
          .select("id, title")
          .lt("id", id)
          .order("id", { ascending: false })
          .limit(1)
          .single();

        setPrevRecipe(prevData);

        // Fetch next recipe
        const { data: nextData } = await supabase
          .from("recipes")
          .select("id, title")
          .gt("id", id)
          .order("id", { ascending: true })
          .limit(1)
          .single();

        setNextRecipe(nextData);

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
  }, [id, toast, navigate]);

  // Add auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Recipe not found</p>
        </div>
      </div>
    );
  }

  const handleNavigation = (recipeId: number) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
          <p className="text-gray-600">{recipe.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <ul className="list-disc pl-5 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <ol className="list-decimal pl-5 space-y-2">
              {recipe.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div>
            <span className="font-medium">Prep Time:</span>
            <p>{recipe.prepTime}</p>
          </div>
          <div>
            <span className="font-medium">Cook Time:</span>
            <p>{recipe.cookTime}</p>
          </div>
          <div>
            <span className="font-medium">Servings:</span>
            <p>{recipe.servings}</p>
          </div>
          <div>
            <span className="font-medium">Meal Type:</span>
            <p>{recipe.mealType}</p>
          </div>
        </div>

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
  );
};

export default RecipeDetail;