import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { supabase } from "@/integrations/supabase/client";

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

const BookRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groupedRecipes, setGroupedRecipes] = useState<GroupedRecipes>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Check auth state before fetching
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return;
        }

        const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        console.log("Fetched recipes:", data);
        
        // Filter recipes for the current book
        const bookRecipes = data.filter((recipe: Recipe) => 
          recipe.acf.libro_associato?.some((book) => book.ID.toString() === id)
        );
        
        // Group recipes by meal type
        const grouped = bookRecipes.reduce((acc: GroupedRecipes, recipe: Recipe) => {
          const mealType = recipe.acf.pasto || 'Other';
          if (!acc[mealType]) {
            acc[mealType] = [];
          }
          acc[mealType].push(recipe);
          return acc;
        }, {});

        setRecipes(bookRecipes);
        setGroupedRecipes(grouped);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast({
          title: "Error",
          description: "Failed to load recipes. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [id, toast, navigate]);

  if (loading) {
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