import React, { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { FavoriteButton } from "@/components/recipe/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface RecipeCardProps {
  title: string;
  image: string;
  cookTime: string;
  difficulty: string;
  recipeId: number;
  onClick: () => void; 
  audio_recipe?: string;
}

export function RecipeCard({ 
  title, 
  image, 
  cookTime, 
  difficulty, 
  recipeId, 
  onClick,
  audio_recipe 
}: RecipeCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(audio_recipe));

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audio_recipe) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const handleEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  return (
    <Card 
      className="overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] animate-fade-up group relative"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <div className="flex items-center gap-2">
            {audio_recipe && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayAudio}
                className="h-8 w-8 p-0 hover:bg-transparent"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-primary" />
                ) : (
                  <Play className="h-4 w-4 text-muted-foreground hover:text-primary" />
                )}
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
