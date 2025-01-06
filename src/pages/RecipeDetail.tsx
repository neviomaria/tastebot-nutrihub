import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Recipe } from "@/types/recipe";
import { useQuery } from "@tanstack/react-query";
import { RecipeHeader } from "@/components/recipe/RecipeHeader";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { RecipeDetails } from "@/components/recipe/RecipeDetails";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Recipe not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <RecipeHeader
        onPrevious={() => handleNavigation('prev')}
        onNext={() => handleNavigation('next')}
        mealType={recipe?.acf?.pasto}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <RecipeImage
            imageUrl={recipe.acf.recipe_image?.url}
            title={recipe.title}
          />
        </div>
        <RecipeDetails recipe={recipe} />
      </div>
    </div>
  );
};

export default RecipeDetail;