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

export const genderOptions = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say"
] as const;

export const cookingSkillLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Professional"
] as const;

export const mealPreferences = [
  "Quick Meals (<30 mins)",
  "Batch Cooking",
  "Family-Friendly",
  "High Protein",
  "Low-Calorie"
] as const;

export const medicalConditions = [
  "None",
  "Diabetes",
  "Hypertension",
  "High Cholesterol",
  "Kidney Disease",
  "Other"
] as const;

export const groceryBudgets = [
  "Low (<$50/week)",
  "Medium ($50–$100/week)",
  "High (>$100/week)"
] as const;

export const religiousRestrictions = [
  "None",
  "Halal",
  "Kosher",
  "No Pork",
  "Other"
] as const;

export const profileSchema = z.object({
  // Basic profile info (mandatory)
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  avatar_url: z.string().optional(),
  country: z.string().min(2, "Country must be at least 2 characters"),
  
  // All other fields are optional
  dietary_preferences: z.array(z.enum(dietaryPreferences)).optional().nullable(),
  allergies: z.array(z.enum(allergies)).optional().nullable(), // Explicitly optional
  health_goal: z.enum(healthGoals).optional().nullable(),
  activity_level: z.enum(activityLevels).optional().nullable(),
  planning_preference: z.enum(planningPreferences).optional().nullable(),
  favorite_cuisines: z.array(z.enum(cuisineTypes)).optional().nullable(),
  other_dietary_preferences: z.string().optional().nullable(),
  other_allergies: z.string().optional().nullable(),
  other_cuisines: z.string().optional().nullable(),
  weight_kg: z.number().min(20).max(300).optional().nullable(),
  height_cm: z.number().min(100).max(250).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(genderOptions).optional().nullable(),
  cooking_skill_level: z.enum(cookingSkillLevels).optional().nullable(),
  meal_preferences: z.array(z.enum(mealPreferences)).optional().nullable(),
  medical_conditions: z.array(z.enum(medicalConditions)).optional().nullable(),
  other_medical_conditions: z.string().optional().nullable(),
  preferred_grocery_stores: z.array(z.string()).optional().nullable(),
  grocery_budget: z.enum(groceryBudgets).optional().nullable(),
  religious_restrictions: z.array(z.enum(religiousRestrictions)).optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;