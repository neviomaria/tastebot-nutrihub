import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Recipe } from "@/types/recipe";
import { BookRecipesHeader } from "@/components/book/BookRecipesHeader";
import { RecipesTabs } from "@/components/book/RecipesTabs";
import { useBookRecipes } from "@/hooks/use-book-recipes";

type GroupedRecipes = {
  [key: string]: Recipe[];
};

const BookRecipes = () => {
  const [groupedRecipes, setGroupedRecipes] = useState<GroupedRecipes>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

  const { data: recipes, isLoading, error } = useBookRecipes(id!);

  // Group recipes by meal type when recipes data changes
  useEffect(() => {
    if (recipes) {
      const grouped = recipes.reduce((acc: GroupedRecipes, recipe: Recipe) => {
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
  }, [recipes, activeTab]);

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load recipes. Please try again later.",
      variant: "destructive",
    });
    return null;
  }

  if (!id) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-500">Invalid book ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <BookRecipesHeader id={id} />
        
        {Object.keys(groupedRecipes).length === 0 ? (
          <p className="text-gray-500">No recipes available for this book.</p>
        ) : (
          <RecipesTabs
            groupedRecipes={groupedRecipes}
            activeTab={activeTab}
            currentTabIndex={currentTabIndex}
            handleTabClick={handleTabClick}
            handlePrev={handlePrev}
            handleNext={handleNext}
          />
        )}
      </div>
    </div>
  );
};

export default BookRecipes;