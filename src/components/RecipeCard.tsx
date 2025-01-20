import { Card, CardHeader } from "@/components/ui/card";
import { FavoriteButton } from "@/components/recipe/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Speaker } from "lucide-react";
import { useState } from "react";

interface RecipeCardProps {
  title: string;
  image: string;
  cookTime: string;
  difficulty: string;
  recipeId: number;
  onClick: () => void;
  audioUrl?: string;
}

export function RecipeCard({ 
  title, 
  image, 
  cookTime, 
  difficulty, 
  recipeId, 
  onClick,
  audioUrl 
}: RecipeCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(audioUrl));

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioUrl) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

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
          <div className="flex items-center gap-2">
            {audioUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayAudio}
                className="group hover:bg-transparent"
              >
                <Speaker className={`h-4 w-4 ${
                  isPlaying 
                    ? 'text-primary' 
                    : 'group-hover:text-primary'
                }`} />
                <span className="sr-only">
                  {isPlaying ? 'Stop audio' : 'Play audio'}
                </span>
              </Button>
            )}
            <FavoriteButton recipeId={recipeId} />
          </div>
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