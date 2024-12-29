import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { RecipeCard } from "@/components/RecipeCard";
import { useToast } from "@/components/ui/use-toast";
import { ProfileCompletionWidget } from "@/components/widgets/ProfileCompletionWidget";

const RECIPES = [
  {
    id: 1,
    title: "Classic Margherita Pizza",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca",
    cookTime: "30 mins",
    difficulty: "Easy",
  },
  {
    id: 2,
    title: "Avocado Toast",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d",
    cookTime: "10 mins",
    difficulty: "Easy",
  },
  {
    id: 3,
    title: "Chocolate Chip Cookies",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e",
    cookTime: "25 mins",
    difficulty: "Medium",
  },
  {
    id: 4,
    title: "Greek Salad",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999",
    cookTime: "15 mins",
    difficulty: "Easy",
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredRecipes = RECIPES.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecipeClick = (title: string) => {
    toast({
      title: "Coming Soon!",
      description: `Full recipe for ${title} will be available in the next update.`,
    });
  };

  return (
    <div className="h-full animate-fade-up space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileCompletionWidget />
      </div>

      <div>
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Discover Delicious Recipes
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find and cook your favorite meals with our easy-to-follow recipes
          </p>
          <SearchBar onSearch={setSearchQuery} />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              image={recipe.image}
              cookTime={recipe.cookTime}
              difficulty={recipe.difficulty}
              onClick={() => handleRecipeClick(recipe.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;