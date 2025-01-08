import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { RecipeCard } from "@/components/RecipeCard";
import { useNavigate } from "react-router-dom";

interface RecipesTabsProps {
  groupedRecipes: { [key: string]: Recipe[] };
  activeTab: string;
  currentTabIndex: number;
  handleTabClick: (value: string) => void;
  handlePrev: (e: React.MouseEvent) => void;
  handleNext: (e: React.MouseEvent) => void;
}

export function RecipesTabs({
  groupedRecipes,
  activeTab,
  currentTabIndex,
  handleTabClick,
  handlePrev,
  handleNext,
}: RecipesTabsProps) {
  const navigate = useNavigate();
  const tabs = Object.keys(groupedRecipes);

  return (
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
  );
}