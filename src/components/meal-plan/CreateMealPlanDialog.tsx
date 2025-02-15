import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const form = useForm<CreateMealPlanFormValues>({
    resolver: zodResolver(createMealPlanSchema),
    defaultValues: {
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      duration: "7 Days",
      meals_per_day: ["breakfast", "lunch", "dinner"],
      selected_books: [],
    },
  });

  const { userBooks } = useMealPlanUserData(form);

  // Set all books as selected by default when userBooks changes
  useEffect(() => {
    if (userBooks.length > 0) {
      form.setValue('selected_books', userBooks.map(book => book.book_title));
    }
  }, [userBooks, form]);

  const onSubmit = async (values: CreateMealPlanFormValues) => {
    try {
      console.log("Starting meal plan creation with values:", values);
      setIsGenerating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create meal plan
      const { data: mealPlan, error: createError } = await supabase
        .from("meal_plans")
        .insert({
          user_id: user.id,
          start_date: values.start_date,
          end_date: values.end_date,
          meals_per_day: values.meals_per_day,
          selected_books: values.selected_books,
          status: 'active',
          duration: values.duration,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating meal plan:", createError);
        throw createError;
      }

      if (!mealPlan) {
        throw new Error("No meal plan data returned");
      }

      console.log("Meal plan created, generating items...");

      // Generate meal plan items using AI
      const { data: generatedData, error: generateError } = await supabase.functions.invoke('generate-meal-plan', {
        body: { mealPlanId: mealPlan.id }
      });

      if (generateError) {
        console.error("Error generating meal plan:", generateError);
        throw generateError;
      }

      console.log("Generation response:", generatedData);

      if (!generatedData) {
        throw new Error("No data returned from meal plan generation");
      }

      toast({
        title: "Success",
        description: "Meal plan created successfully",
      });

      setOpen(false);
      form.reset();
      onSuccess();
      // Navigate to the meal plan detail page
      navigate(`/meal-plan/${mealPlan.id}`);
    } catch (error) {
      console.error("Error in meal plan creation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create meal plan",
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
