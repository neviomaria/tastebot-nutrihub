import { Card, CardHeader } from "@/components/ui/card";

interface RecipeCardProps {
  title: string;
  image: string;
  cookTime: string;
  difficulty: string;
  onClick: () => void;
}

export function RecipeCard({ title, image, cookTime, difficulty, onClick }: RecipeCardProps) {
  // Function to transform the image URL to use medium dimension
  const getRecipeAppImage = (url: string) => {
    if (!url) return "/placeholder.svg";
    
    try {
      // Check if the URL is from WordPress
      if (url.includes('brainscapebooks.com')) {
        // Split the URL at the last occurrence of a dot to separate extension
        const lastDotIndex = url.lastIndexOf('.');
        if (lastDotIndex === -1) return url;
        
        const urlWithoutExtension = url.substring(0, lastDotIndex);
        const extension = url.substring(lastDotIndex);
        
        // Add -medium before the extension
        return `${urlWithoutExtension}-medium${extension}`;
      }
      return url;
    } catch (error) {
      console.error('Error transforming image URL:', error);
      return "/placeholder.svg";
    }
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
            console.log('Image failed to load:', image);
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