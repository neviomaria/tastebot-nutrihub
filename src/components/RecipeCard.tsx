import { Card, CardHeader } from "@/components/ui/card";

interface RecipeCardProps {
  title: string;
  image: string;
  cookTime: string;
  difficulty: string;
  onClick: () => void;
}

export function RecipeCard({ title, image, cookTime, difficulty, onClick }: RecipeCardProps) {
  // Function to transform the image URL to use recipe-app dimension
  const getRecipeAppImage = (url: string) => {
    if (!url) return "/placeholder.svg";
    // Check if the URL is from WordPress
    if (url.includes('brainscapebooks.com')) {
      // Split the URL at the file extension
      const urlParts = url.split('.');
      const extension = urlParts.pop(); // Get the file extension
      // Add -recipe-app before the extension
      return `${urlParts.join('.')}-recipe-app.${extension}`;
    }
    return url;
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] animate-fade-up"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={getRecipeAppImage(image)} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <CardHeader className="p-4">
        <h3 className="font-semibold text-lg text-recipe-500">{title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{cookTime}</span>
          <span>•</span>
          <span>{difficulty}</span>
        </div>
      </CardHeader>
    </Card>
  );
}