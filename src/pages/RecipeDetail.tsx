import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Recipe } from "@/types/recipe";
import { RecipeMetadata } from "@/components/recipe/RecipeMetadata";
import { RecipeContent } from "@/components/recipe/RecipeContent";
import { useQuery } from "@tanstack/react-query";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Fetch all recipes for navigation
  const { data: recipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      return await response.json() as Recipe[];
    },
    enabled: !!session
  });

  // Fetch current recipe data
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const recipes: Recipe[] = await response.json();
      const recipe = recipes.find(r => r.id.toString() === id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      return recipe;
    },
    enabled: !!session && !!id,
    meta: {
      errorHandler: (error: Error) => {
        toast({
          title: "Error",
          description: "Failed to load recipe details. Please try again later.",
          variant: "destructive",
        });
      }
    }
  });

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

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!recipes || !id) return;
    
    const currentIndex = recipes.findIndex(r => r.id.toString() === id);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : recipes.length - 1;
    } else {
      newIndex = currentIndex < recipes.length - 1 ? currentIndex + 1 : 0;
    }

    navigate(`/recipe/${recipes[newIndex].id}`);
  };

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigation('prev')}
            className="rounded-full"
          >
            <ArrowLeftCircle className="h-4 w-4" />
            <span className="sr-only">Previous recipe</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigation('next')}
            className="rounded-full"
          >
            <ArrowRightCircle className="h-4 w-4" />
            <span className="sr-only">Next recipe</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <div className="sticky top-6">
            {recipe.acf.recipe_image?.url && (
              <div className="aspect-[3/4] w-full rounded-lg overflow-hidden">
                <img
                  src={recipe.acf.recipe_image.url}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
            <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: recipe.content }} />
          </div>

          <RecipeMetadata
            prepTime={recipe.acf.prep_time}
            cookTime={recipe.acf.cook_time}
            mealType={recipe.acf.pasto}
          />

          <RecipeContent
            ingredients={recipe.acf.ingredients || []}
            instructions={recipe.acf.instructions || []}
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;