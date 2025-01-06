import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  recipeId: number;
  variant?: "default" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FavoriteButton({ recipeId, variant = "ghost", size = "icon" }: FavoriteButtonProps) {
  const { favorites, isLoadingFavorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites.includes(recipeId);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(recipeId);
      }}
      disabled={isLoadingFavorites}
      className={cn(
        "transition-colors",
        isFavorited && "text-red-500 hover:text-red-600"
      )}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
      <span className="sr-only">
        {isFavorited ? "Remove from favorites" : "Add to favorites"}
      </span>
    </Button>
  );
}