import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Recipe } from "@/types/recipe";
import { useQuery } from "@tanstack/react-query";
import { FavoriteButton } from "@/components/recipe/FavoriteButton";
import { RecipeMetadata } from "@/components/recipe/RecipeMetadata";
import { RecipeContent } from "@/components/recipe/RecipeContent";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Timer } from "@/components/timer/Timer";

interface RecipeDetailsProps {
  recipe: Recipe;
}

export function RecipeDetailsContent({ recipe }: RecipeDetailsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(recipe.acf.audio_recipe));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  const handlePlayPause = () => {
    if (!recipe.acf.audio_recipe) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <div 
            className="text-gray-600" 
            dangerouslySetInnerHTML={{ __html: recipe.content }} 
          />
        </div>
        <div className="flex gap-2 items-center">
          <Timer 
            duration={recipe.acf.cook_time ? parseInt(recipe.acf.cook_time) * 60 : 0} 
            className="mr-4"
          />
          <FavoriteButton 
            recipeId={recipe.id} 
            size="default" 
            variant="ghost" 
          />
        </div>
      </div>

      {recipe.acf.audio_recipe && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            className="h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-primary" />
            ) : (
              <Play className="h-6 w-6 text-primary" />
            )}
            <span className="sr-only">
              {isPlaying ? 'Pause audio' : 'Play audio'}
            </span>
          </Button>
          
          <div className="flex-1 space-y-1">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      <RecipeMetadata
        prepTime={recipe.acf.prep_time}
        cookTime={recipe.acf.cook_time}
        servings={recipe.acf.servings}
      />

      <RecipeContent
        ingredients={recipe.acf.ingredients || []}
        instructions={recipe.acf.instructions || []}
        nutritionFacts={recipe.acf.nutrition_facts || []}
      />
    </div>
  );
}

// Rename the exported component to avoid naming conflict
export { RecipeDetailsContent as RecipeDetails };
