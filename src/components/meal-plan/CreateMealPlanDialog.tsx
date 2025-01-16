import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle } from "lucide-react";
import { createMealPlanSchema } from "@/schemas/meal-plan";
import type { CreateMealPlanFormValues } from "@/schemas/meal-plan";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";
import { MealPlanForm } from "./MealPlanForm";
import { useMealPlanUserData } from "@/hooks/meal-plan/use-meal-plan-user-data";

export const CreateMealPlanDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateMealPlanFormValues>({
    resolver: zodResolver(createMealPlanSchema),
    defaultValues: {
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      daily_calories: 2000,
      meals_per_day: ["Breakfast", "Lunch", "Dinner"],
      excluded_ingredients: [],
      preferred_cuisines: [],
      selected_books: [],
    },
  });

  const { userBooks } = useMealPlanUserData(form);

  const onSubmit = async (values: CreateMealPlanFormValues) => {
    try {
      setIsGenerating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create meal plan
      const { data: mealPlan, error } = await supabase
        .from("meal_plans")
        .insert({
          user_id: user.id,
          start_date: values.start_date,
          end_date: values.end_date,
          daily_calories: values.daily_calories,
          objective: values.objective,
          meals_per_day: values.meals_per_day,
          time_constraint: values.time_constraint,
          excluded_ingredients: values.excluded_ingredients,
          preferred_cuisines: values.preferred_cuisines,
          selected_books: values.selected_books,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Generate meal plan items using AI
      const { error: generateError } = await supabase.functions.invoke('generate-meal-plan', {
        body: { mealPlanId: mealPlan.id }
      });

      if (generateError) throw generateError;

      toast({
        title: "Success",
        description: "Meal plan created and generated successfully",
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to create meal plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Meal Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Meal Plan</DialogTitle>
          <DialogDescription>
            Create a personalized meal plan based on your preferences
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <MealPlanForm 
            form={form} 
            onSubmit={onSubmit}
            userBooks={userBooks}
            isGenerating={isGenerating}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};