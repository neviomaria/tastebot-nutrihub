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
import { SearchBar } from "@/components/SearchBar";
import { Recipe } from "@/types/recipe";

const BookRecipes = () => {
  const [groupedRecipes, setGroupedRecipes] = useState<{ [key: string]: Recipe[] }>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [searchParams, setSearchParams] = useState<{ keywords: string; ingredients: string[] }>({
    keywords: "",
    ingredients: [],
  });
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const { data: recipes, isLoading, error } = useQuery({
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

  const cleanIngredientName = (ingredient: string): string => {
    // Check for nutritional values first
    const nutritionKeywords = [
      'calories', 'protein', 'carbohydrates', 'sugars', 'dietary fiber', 'fat',
      'sodium', 'potassium', 'phosphorus', 'calcium', 'iron', 'vitamin',
      'cholesterol', 'saturated', 'trans', 'sugar', 'fiber', 'protein'
    ];
    
    if (nutritionKeywords.some(keyword => 
      ingredient.toLowerCase().includes(keyword) ||
      ingredient.toLowerCase().match(/\d+\s*mg/) ||  // Matches patterns like "10mg"
      ingredient.toLowerCase().match(/\d+\s*g/)      // Matches patterns like "10g"
    )) {
      return '';
    }
    
    // Remove quantities, measurements, and descriptive terms
    let cleanedName = ingredient
      .replace(/^[\d\/\s]+/, '') // Remove numbers at start
      .replace(/^\d+\/?\d*\s*(tablespoon|tbsp|teaspoon|tsp|cup|g|gram|ml|pound|lb|oz|ounce|piece|slice|can|package|to taste|optional|\(.*?\))/gi, '')
      .replace(/,.*$/, '') // Remove everything after comma
      .replace(/^(fresh|dried|mini|large|small|medium|dark|light)\s+/gi, '') // Remove common descriptive terms
      .trim();
    
    return cleanedName;
  };

  useEffect(() => {
    if (recipes) {
      const bookRecipes = recipes
        .filter((recipe: Recipe) => 
          recipe.acf.libro_associato?.some((book) => book.ID.toString() === id)
        )
        .filter((recipe: Recipe) => {
          const matchesKeywords = searchParams.keywords
            ? recipe.title.toLowerCase().includes(searchParams.keywords.toLowerCase())
            : true;

          const matchesIngredients = searchParams.ingredients.length
            ? searchParams.ingredients.every((ingredient) =>
                Array.isArray(recipe.acf.ingredients) && recipe.acf.ingredients.some((ing) => {
                  const cleanedIngredient = cleanIngredientName(ing?.ingredient_item || '');
                  return cleanedIngredient.toLowerCase().includes(ingredient.toLowerCase());
                })
              )
            : true;

          return matchesKeywords && matchesIngredients;
        });
      
      const grouped = bookRecipes.reduce((acc: { [key: string]: Recipe[] }, recipe: Recipe) => {
        const mealType = recipe.acf.pasto || 'Other';
        if (!acc[mealType]) {
          acc[mealType] = [];
        }
        acc[mealType].push(recipe);
        return acc;
      }, {});

      setGroupedRecipes(grouped);
      if (Object.keys(grouped).length > 0 && !activeTab) {
        setActiveTab(Object.keys(grouped)[0]);
      }
    }
  }, [recipes, id, activeTab, searchParams]);

  const allIngredients = recipes
    ? Array.from(
        new Set(
          recipes
            .filter((recipe: Recipe) => 
              recipe.acf.libro_associato?.some((book) => book.ID.toString() === id)
            )
            .flatMap((recipe: Recipe) => {
              console.log('Recipe ingredients:', recipe.acf.ingredients);
              return Array.isArray(recipe.acf.ingredients) 
                ? recipe.acf.ingredients
                    .filter(ing => ing && ing.ingredient_item)
                    .map(ing => cleanIngredientName(ing.ingredient_item))
                    .filter(ingredient => ingredient !== '') // Remove empty strings (nutritional values)
                : [];
            })
        )
      )
    : [];

  const handleSearch = (query: { keywords: string; ingredients: string[] }) => {
    setSearchParams(query);
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

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} ingredients={allIngredients} />
        </div>

        {Object.keys(groupedRecipes).length === 0 ? (
          <p className="text-gray-500">No recipes available for this book.</p>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-card border">
              {Object.keys(groupedRecipes).map((mealType) => (
                <TabsTrigger
                  key={mealType}
                  value={mealType}
                  className="capitalize"
                >
                  {mealType}
                </TabsTrigger>
              ))}
            </TabsList>
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