import * as z from "zod";

export const createMealPlanSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  daily_calories: z.number().min(500).max(10000),
});

export type CreateMealPlanFormValues = z.infer<typeof createMealPlanSchema>;