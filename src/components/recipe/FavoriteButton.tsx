import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/use-favorites";

interface FavoriteButtonProps {
  recipeId: number;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function FavoriteButton({ recipeId, size = "sm", variant = "ghost" }: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(recipeId);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    try {
      setIsLoading(true);
      await toggleFavorite(recipeId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className="h-8 w-8 p-0 hover:bg-transparent"
    >
      <Heart
        className={`h-4 w-4 ${
          isFavorite 
            ? 'fill-current text-white' 
            : 'text-muted-foreground hover:text-white'
        }`}
      />
      <span className="sr-only">
        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </Button>
  );
}