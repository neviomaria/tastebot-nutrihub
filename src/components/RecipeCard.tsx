import { Card, CardHeader } from "@/components/ui/card";
import { FavoriteButton } from "@/components/recipe/FavoriteButton";

interface RecipeCardProps {
  title: string;
  image: string;
  cookTime: string;
  difficulty: string;
  recipeId: number;
  onClick: () => void;
}

export function RecipeCard({ title, image, cookTime, difficulty, recipeId, onClick }: RecipeCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] animate-fade-up group relative"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            console.log('Image failed to load:', image);
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-lg text-recipe-500">{title}</h3>
          <FavoriteButton recipeId={recipeId} />
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{cookTime}</span>
          <span>•</span>
          <span>{difficulty}</span>
        </div>
      </CardHeader>
    </Card>
  );
}