import * as z from "zod";

export const dietaryPreferences = [
  "None",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Low-carb",
  "Gluten-free",
  "Dairy-free",
  "Halal",
  "Kosher",
  "Other"
] as const;

export const allergies = [
  "None",
  "Gluten",
  "Nuts",
  "Dairy",
  "Eggs",
  "Soy",
  "Shellfish",
  "Fish",
  "Wheat",
  "Seeds",
  "Other"
] as const;

export const healthGoals = [
  "Weight Loss",
  "Muscle Gain",
  "General Health",
  "Maintenance",
  "Increase Energy",
  "Improve Digestion",
  "Reduce Inflammation",
  "Manage a Medical Condition"
] as const;

export const activityLevels = [
  "Sedentary",
  "Lightly Active",
  "Moderately Active",
  "Very Active",
  "Extremely Active"
] as const;

export const planningPreferences = [
  "No Preference",
  "Daily Planning",
  "Weekly Planning",
  "Monthly Planning"
] as const;

export const cuisineTypes = [
  "Italian",
  "Indian",
  "Mediterranean",
  "Chinese",
  "Japanese",
  "Mexican",
  "Thai",
  "Middle Eastern",
  "American",
  "African",
  "Vegan Cuisine",
  "Gluten-Free Cuisine",
  "Other"
] as const;

export const profileSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  avatar_url: z.string().optional(),
  dietary_preferences: z.array(z.enum(dietaryPreferences)).min(1, "Please select at least one dietary preference"),
  allergies: z.array(z.enum(allergies)),
  health_goal: z.enum(healthGoals),
  activity_level: z.enum(activityLevels),
  planning_preference: z.enum(planningPreferences),
  favorite_cuisines: z.array(z.enum(cuisineTypes)).min(1, "Please select at least one cuisine"),
  other_dietary_preferences: z.string().optional(),
  other_allergies: z.string().optional(),
  other_cuisines: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;