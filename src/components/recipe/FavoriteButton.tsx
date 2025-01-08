import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FavoriteButtonProps {
  recipeId: number;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function FavoriteButton({ recipeId, size = "sm", variant = "ghost" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if recipe is favorited on component mount
  useState(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data: favorites } = await supabase
        .from('favorites')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('user_id', session.session.user.id)
        .single();

      setIsFavorite(!!favorites);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const createRecipeInDatabase = async () => {
    try {
      // Fetch recipe from WordPress using the correct endpoint
      const response = await fetch(`https://brainscapebooks.com/wp-json/custom/v1/recipes/${recipeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe from WordPress');
      }
      const recipeData = await response.json();

      // Insert recipe into Supabase recipes table
      const { error: insertError } = await supabase
        .from('recipes')
        .upsert({
          id: recipeId,
          title: recipeData.title,
          description: recipeData.content,
          ingredients: recipeData.acf.ingredients?.map((i: any) => i.ingredient_item) || [],
          instructions: recipeData.acf.instructions?.map((i: any) => i.instructions_step) || [],
          prep_time: recipeData.acf.prep_time,
          cook_time: recipeData.acf.cook_time,
          servings: recipeData.acf.servings,
          meal_type: recipeData.acf.pasto,
        });

      if (insertError) {
        throw new Error('Failed to create recipe in database');
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  };

  const toggleFavorite = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast({
          title: "Error",
          description: "Please sign in to favorite recipes",
          variant: "destructive",
        });
        return;
      }

      if (!isFavorite) {
        // Create recipe in database if it doesn't exist
        await createRecipeInDatabase();

        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            recipe_id: recipeId,
            user_id: session.session.user.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Recipe added to favorites",
        });
      } else {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', session.session.user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Recipe removed from favorites",
        });
      }

      setIsFavorite(!isFavorite);
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
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite();
      }}
      disabled={isLoading}
      className="group"
    >
      <Heart
        className={`h-4 w-4 ${
          isFavorite 
            ? 'fill-current text-red-500' 
            : 'group-hover:fill-current text-gray-500 group-hover:text-red-500'
        }`}
      />
      <span className="sr-only">
        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </Button>
  );
}