import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";

interface FavoriteButtonProps {
  recipeId: number;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function FavoriteButton({ recipeId, size = "sm", variant = "ghost" }: FavoriteButtonProps) {
  const { favorites, isLoadingFavorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(recipeId);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(recipeId);
      }}
      disabled={isLoadingFavorites}
      className="group"
    >
      <Heart
        className={`h-4 w-4 ${
          isFavorite 
            ? 'fill-current text-red-500' 
            : 'group-hover:fill-current text-gray-500 group-hover:text-red-500'
        } ${isLoadingFavorites ? 'animate-pulse' : ''}`}
      />
      <span className="sr-only">
        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </Button>
  );
}