import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { createMealPlanSchema, mealPlanObjectives, mealPlanDurations, mealsPerDay, timeConstraints } from "@/schemas/meal-plan";
import { allergies, cuisineTypes } from "@/schemas/profile";
import type { CreateMealPlanFormValues } from "@/schemas/meal-plan";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "date-fns";
import { SelectField } from "@/components/form/SelectField";
import { CheckboxField } from "@/components/form/CheckboxField";

export const CreateMealPlanDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
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

  // Fetch user profile for preferences and books
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("allergies, favorite_cuisines")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    meta: {
      onSuccess: (data) => {
        // Set excluded ingredients from allergies, filtering out "None"
        const selectedAllergies = data?.allergies?.filter(allergy => allergy !== "None") || [];
        form.setValue("excluded_ingredients", selectedAllergies);
        
        // Set preferred cuisines, filtering out "Other"
        const selectedCuisines = data?.favorite_cuisines?.filter(cuisine => cuisine !== "Other") || [];
        form.setValue("preferred_cuisines", selectedCuisines);
      }
    }
  });

  // Fetch user's books
  const { data: userBooks = [] } = useQuery({
    queryKey: ["userBooks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Fetch profile book
      const { data: profile } = await supabase
        .from("profiles")
        .select("book_id, book_title")
        .eq("id", user.id)
        .single();

      // Fetch additional books from user_coupons
      const { data: userCoupons } = await supabase
        .from("user_coupons")
        .select("book_id, book_title")
        .eq("user_id", user.id);

      // Combine books, ensuring no duplicates
      let allBooks = [];
      if (profile?.book_id) {
        allBooks.push({
          book_id: profile.book_id,
          book_title: profile.book_title || ''
        });
      }
      if (userCoupons) {
        userCoupons.forEach(coupon => {
          if (!allBooks.some(book => book.book_id === coupon.book_id)) {
            allBooks.push({
              book_id: coupon.book_id,
              book_title: coupon.book_title
            });
          }
        });
      }

      return allBooks;
    }
  });

  const onSubmit = async (values: CreateMealPlanFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
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

      toast({
        title: "Success",
        description: "Meal plan created successfully",
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <SelectField
                form={form}
                name="objective"
                label="Primary Objective"
                options={mealPlanObjectives}
              />

              <SelectField
                form={form}
                name="duration"
                label="Plan Duration"
                options={mealPlanDurations}
              />

              <CheckboxField
                form={form}
                name="meals_per_day"
                label="Meals Per Day"
                options={mealsPerDay}
              />

              <SelectField
                form={form}
                name="time_constraint"
                label="Time Constraint"
                options={timeConstraints}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="daily_calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Calories Target</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CheckboxField
                form={form}
                name="excluded_ingredients"
                label="Excluded Ingredients"
                options={allergies.filter(allergy => allergy !== "Other")}
              />

              <CheckboxField
                form={form}
                name="preferred_cuisines"
                label="Preferred Cuisines"
                options={cuisineTypes.filter(cuisine => cuisine !== "Other")}
              />

              {userBooks.length > 0 && (
                <CheckboxField
                  form={form}
                  name="selected_books"
                  label="Select Books for Recipes"
                  options={userBooks.map(book => book.book_title)}
                />
              )}

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Create Plan
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};