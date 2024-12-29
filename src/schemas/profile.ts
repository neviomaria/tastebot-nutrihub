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
  // New fields
  weight_kg: z.number().min(20).max(300).optional(),
  height_cm: z.number().min(100).max(250).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(genderOptions).optional(),
  cooking_skill_level: z.enum(cookingSkillLevels).optional(),
  meal_preferences: z.array(z.enum(mealPreferences)).optional(),
  medical_conditions: z.array(z.enum(medicalConditions)).optional(),
  other_medical_conditions: z.string().optional(),
  preferred_grocery_stores: z.array(z.string()).optional(),
  grocery_budget: z.enum(groceryBudgets).optional(),
  religious_restrictions: z.array(z.enum(religiousRestrictions)).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;