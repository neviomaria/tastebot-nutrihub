import { ProfileFormValues } from "@/schemas/profile";

export const getIncompleteFields = (values: ProfileFormValues) => {
  const incompleteFields: string[] = [];
  
  if (!values.weight_kg) incompleteFields.push("Weight");
  if (!values.height_cm) incompleteFields.push("Height");
  if (!values.date_of_birth) incompleteFields.push("Date of Birth");
  if (!values.gender) incompleteFields.push("Gender");
  if (!values.cooking_skill_level) incompleteFields.push("Cooking Skill Level");
  if (!values.health_goal) incompleteFields.push("Health Goal");
  if (!values.activity_level) incompleteFields.push("Activity Level");
  if (!values.planning_preference) incompleteFields.push("Planning Preference");
  if (!values.grocery_budget) incompleteFields.push("Grocery Budget");
  if (!values.dietary_preferences?.length) incompleteFields.push("Dietary Preferences");
  if (!values.allergies?.length) incompleteFields.push("Allergies");
  if (!values.favorite_cuisines?.length) incompleteFields.push("Favorite Cuisines");
  if (!values.meal_preferences?.length) incompleteFields.push("Meal Preferences");
  if (!values.medical_conditions?.length) incompleteFields.push("Medical Conditions");
  if (!values.religious_restrictions?.length) incompleteFields.push("Religious Restrictions");
  if (!values.preferred_grocery_stores?.length) incompleteFields.push("Preferred Grocery Stores");

  return incompleteFields;
};