import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [activeTab, setActiveTab] = useState<string>("");
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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
      // Set the first meal type as active tab
      if (Object.keys(grouped).length > 0 && !activeTab) {
        setActiveTab(Object.keys(grouped)[0]);
      }
    }
  }, [recipes, id, activeTab]);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const tabs = Object.keys(groupedRecipes);
    if (currentTabIndex < tabs.length - 1) {
      setCurrentTabIndex(currentTabIndex + 1);
      setActiveTab(tabs[currentTabIndex + 1]);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    const tabs = Object.keys(groupedRecipes);
    if (currentTabIndex > 0) {
      setCurrentTabIndex(currentTabIndex - 1);
      setActiveTab(tabs[currentTabIndex - 1]);
    }
  };

  const handleTabClick = (value: string) => {
    const tabs = Object.keys(groupedRecipes);
    const index = tabs.indexOf(value);
    setCurrentTabIndex(index);
    setActiveTab(value);
  };

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
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

  const tabs = Object.keys(groupedRecipes);

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
          <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
            {/* Desktop Tabs */}
            <div className="hidden md:block">
              <TabsList className="mb-6 bg-card border">
                {tabs.map((mealType) => (
                  <TabsTrigger
                    key={mealType}
                    value={mealType}
                    className="capitalize"
                  >
                    {mealType}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-2 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  disabled={currentTabIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="font-medium capitalize">
                  {tabs[currentTabIndex]}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentTabIndex === tabs.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {Object.entries(groupedRecipes).map(([mealType, mealRecipes]) => (
              <TabsContent key={mealType} value={mealType}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mealRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      title={recipe.title}
                      image={recipe.acf.recipe_image?.url || '/placeholder.svg'}
                      cookTime={`Prep: ${recipe.acf.prep_time} | Cook: ${recipe.acf.cook_time}`}
                      difficulty="Easy"
                      recipeId={recipe.id}
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default BookRecipes;