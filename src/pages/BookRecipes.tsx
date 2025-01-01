import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";

interface Recipe {
  id: number;
  title: string;
  content: string;
  acf: {
    prep_time: string;
    cook_time: string;
    libro_associato: Array<{
      ID: number;
      post_title: string;
    }>;
    recipe_image: {
      url: string;
    };
  };
}

const BookRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { id } = useParams();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
        const data = await response.json();
        
        // Filter recipes for the current book
        const bookRecipes = data.filter((recipe: Recipe) => 
          recipe.acf.libro_associato?.some((book) => book.ID.toString() === id)
        );
        
        setRecipes(bookRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast({
          title: "Error",
          description: "Failed to load recipes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [id, toast]);

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

        {recipes.length === 0 ? (
          <p className="text-gray-500">No recipes available for this book.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                image={recipe.acf.recipe_image?.url || '/placeholder.svg'}
                cookTime={`Prep: ${recipe.acf.prep_time} | Cook: ${recipe.acf.cook_time}`}
                difficulty="Easy"
                onClick={() => {
                  toast({
                    title: "Recipe Selected",
                    description: "Recipe details coming soon!",
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookRecipes;