import * as z from "zod";

export const mealPlanObjectives = [
  "Weight Loss",
  "Muscle Gain",
  "Detox",
  "General Health",
  "Energy Boost",
  "Balanced Diet",
  "Low-Carb",
  "Seasonal Eating"
] as const;

export const mealPlanDurations = [ 
  "1 Day",
  "3 Days",
  "7 Days",
  "14 Days"
] as const;

export const mealsPerDay = [
  "breakfast",
  "lunch",
  "dinner",
  "morning_snack",
  "afternoon_snack",
  "evening_snack"
] as const;

export const timeConstraints = [
  "Quick (<30 min)",
  "Standard (30-60 min)",
  "Extended (>60 min)"
] as const;

export const createMealPlanSchema = z.object({
  objective: z.enum(mealPlanObjectives).optional(),
  duration: z.enum(mealPlanDurations),
  meals_per_day: z.array(z.enum(mealsPerDay)).min(1, "Select at least one meal"),
  time_constraint: z.enum(timeConstraints).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  daily_calories: z.number().min(500).max(10000).optional(),
  excluded_ingredients: z.array(z.string()).optional(),
  preferred_cuisines: z.array(z.string()).optional(),
  selected_books: z.array(z.string()).optional(),
});

export type CreateMealPlanFormValues = z.infer<typeof createMealPlanSchema>;
