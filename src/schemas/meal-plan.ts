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
  "Breakfast",
  "Lunch",
  "Dinner",
  "Morning Snack",
  "Afternoon Snack",
  "Evening Snack"
] as const;

export const timeConstraints = [
  "Quick (<30 min)",
  "Standard (30-60 min)",
  "Extended (>60 min)"
] as const;

export const createMealPlanSchema = z.object({
  objective: z.enum(mealPlanObjectives),
  duration: z.enum(mealPlanDurations),
  meals_per_day: z.array(z.enum(mealsPerDay)),
  time_constraint: z.enum(timeConstraints),
  start_date: z.string(),
  end_date: z.string(),
  daily_calories: z.number().min(500).max(10000).optional(),
  excluded_ingredients: z.array(z.string()).optional(),
  preferred_cuisines: z.array(z.string()).optional(),
  selected_books: z.array(z.string()).optional(),
});

export type CreateMealPlanFormValues = z.infer<typeof createMealPlanSchema>;