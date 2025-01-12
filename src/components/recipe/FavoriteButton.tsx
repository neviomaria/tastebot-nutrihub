import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
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

  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: favorites, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking favorite status:', error);
        return;
      }

      setIsFavorite(!!favorites);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const createRecipeInDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Fetch recipe data from WordPress
      const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes from WordPress');
      }
      const recipes = await response.json();
      
      // Find the specific recipe
      const recipeData = recipes.find((recipe: any) => recipe.id === recipeId);
      if (!recipeData) {
        throw new Error('Recipe not found');
      }

      // Transform ingredients and instructions arrays
      const ingredients = recipeData.acf.ingredients?.map((item: any) => 
        typeof item.ingredient_item === 'string' ? item.ingredient_item : ''
      ).filter(Boolean) || [];

      const instructions = recipeData.acf.instructions?.map((item: any) => 
        typeof item.instructions_step === 'string' ? item.instructions_step : ''
      ).filter(Boolean) || [];

      // Parse servings to integer or use default
      const servings = parseInt(recipeData.acf.servings) || 4;

      // Insert recipe into Supabase recipes table
      const { error: insertError } = await supabase
        .from('recipes')
        .upsert({
          id: recipeId,
          title: recipeData.title.rendered || recipeData.title,
          description: recipeData.content.rendered || recipeData.content,
          ingredients,
          instructions,
          prep_time: recipeData.acf.prep_time || '',
          cook_time: recipeData.acf.cook_time || '',
          servings,
          meal_type: recipeData.acf.pasto || 'main',
          user_id: user.id
        });

      if (insertError) {
        console.error('Insert error:', insertError);
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
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
            user_id: session.user.id,
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
          .eq('user_id', session.user.id);

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
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 ${
            isFavorite 
              ? 'fill-current text-red-500' 
              : 'group-hover:fill-current text-gray-500 group-hover:text-red-500'
          }`}
        />
      )}
      <span className="sr-only">
        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </span>
    </Button>
  );
}