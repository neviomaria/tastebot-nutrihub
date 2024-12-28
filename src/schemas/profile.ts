import * as z from "zod";

export const dietaryPreferences = [
  "None",
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Pescatarian",
  "Gluten-Free",
] as const;

export const activityLevels = [
  "Sedentary",
  "Lightly Active",
  "Moderately Active",
  "Very Active",
] as const;

export const healthGoals = [
  "Weight Loss",
  "Muscle Gain",
  "General Health",
  "Maintenance",
] as const;

export const planningPreferences = [
  "Daily Planning",
  "Weekly Planning",
  "No Preference",
] as const;

export const cuisineTypes = [
  "Italian",
  "Japanese",
  "Indian",
  "Mediterranean",
  "Mexican",
  "Thai",
  "French",
  "Chinese",
  "Korean",
  "American",
] as const;

export const profileSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  avatar_url: z.string().optional(),
  dietary_preferences: z.enum(dietaryPreferences),
  allergies: z.string().optional(),
  health_goal: z.enum(healthGoals),
  activity_level: z.enum(activityLevels),
  planning_preference: z.enum(planningPreferences),
  favorite_cuisines: z.enum(cuisineTypes),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;