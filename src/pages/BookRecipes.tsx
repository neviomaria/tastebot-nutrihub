import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Recipe {
  id: number;
  title: string;
  content: string;
  acf: {
    prep_time: string;
    cook_time: string;
    pasto: string;
    libro_associato: Array<{
      ID: number;
      post_title: string;
    }>;
    recipe_image: {
      url: string;
    };
  };
}

type GroupedRecipes = {
  [key: string]: Recipe[];
};

const fetchRecipes = async () => {
  const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

const BookRecipes = () => {
  const [groupedRecipes, setGroupedRecipes] = useState<GroupedRecipes>({});
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();

  // Check authentication status
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    retry: false,
    meta: {
      errorHandler: async (error: Error) => {
        console.error("Session error:", error);
        await supabase.auth.signOut();
        navigate("/auth");
      }
    }
  });

  // Fetch recipes with caching
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    meta: {
      errorHandler: (error: Error) => {
        const errorMessage = error instanceof Error && error.message.includes("NetworkError")
          ? "Unable to connect to the recipe service. Please check your internet connection and try again."
          : "Failed to load recipes. Please try again later.";
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  });

  // Group recipes by meal type when recipes data changes
  useEffect(() => {
    if (recipes) {
      const bookRecipes = recipes.filter((recipe: Recipe) => 
        recipe.acf.libro_associato?.some((book) => book.ID.toString() === id)
      );
      
      const grouped = bookRecipes.reduce((acc: GroupedRecipes, recipe: Recipe) => {
        const mealType = recipe.acf.pasto || 'Other';
        if (!acc[mealType]) {
          acc[mealType] = [];
        }
        acc[mealType].push(recipe);
        return acc;
      }, {});

      setGroupedRecipes(grouped);
    }
  }, [recipes, id]);

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={`/book/${id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Book
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-6">Book Recipes</h1>

        {Object.keys(groupedRecipes).length === 0 ? (
          <p className="text-gray-500">No recipes available for this book.</p>
        ) : (
          Object.entries(groupedRecipes).map(([mealType, mealRecipes]) => (
            <div key={mealType} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-recipe-500 capitalize">{mealType}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mealRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    title={recipe.title}
                    image={recipe.acf.recipe_image?.url || '/placeholder.svg'}
                    cookTime={`Prep: ${recipe.acf.prep_time} | Cook: ${recipe.acf.cook_time}`}
                    difficulty="Easy"
                    onClick={() => {
                      window.location.href = `/recipe/${recipe.id}`;
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookRecipes;