import { ProfileFormValues } from "@/schemas/profile";

export const getIncompleteFields = (values: ProfileFormValues) => {
  const incompleteFields: string[] = [];
  
  // Basic Information
  if (!values.first_name?.trim()) incompleteFields.push("First Name");
  if (!values.last_name?.trim()) incompleteFields.push("Last Name");
  if (!values.country?.trim()) incompleteFields.push("Country");

  // Personal Information
  if (!values.weight_kg) incompleteFields.push("Weight");
  if (!values.height_cm) incompleteFields.push("Height");
  if (!values.date_of_birth) incompleteFields.push("Date of Birth");
  if (!values.gender) incompleteFields.push("Gender");

  // Preferences
  if (!values.cooking_skill_level) incompleteFields.push("Cooking Skill Level");
  if (!values.health_goal) incompleteFields.push("Health Goal");
  if (!values.activity_level) incompleteFields.push("Activity Level");
  if (!values.planning_preference) incompleteFields.push("Planning Preference");
  if (!values.grocery_budget) incompleteFields.push("Grocery Budget");

  // Arrays (checking for empty arrays)
  if (!values.dietary_preferences?.length) incompleteFields.push("Dietary Preferences");
  if (!values.allergies?.length) incompleteFields.push("Allergies");
  if (!values.favorite_cuisines?.length) incompleteFields.push("Favorite Cuisines");
  if (!values.meal_preferences?.length) incompleteFields.push("Meal Preferences");
  if (!values.medical_conditions?.length) incompleteFields.push("Medical Conditions");
  if (!values.religious_restrictions?.length) incompleteFields.push("Religious Restrictions");
  if (!values.preferred_grocery_stores?.length) incompleteFields.push("Preferred Grocery Stores");

  // Check "Other" fields when corresponding arrays contain "Other"
  if (values.dietary_preferences?.includes("Other") && !values.other_dietary_preferences?.trim()) {
    incompleteFields.push("Other Dietary Preferences Details");
  }
  if (values.allergies?.includes("Other") && !values.other_allergies?.trim()) {
    incompleteFields.push("Other Allergies Details");
  }
  if (values.favorite_cuisines?.includes("Other") && !values.other_cuisines?.trim()) {
    incompleteFields.push("Other Cuisines Details");
  }
  if (values.medical_conditions?.includes("Other") && !values.other_medical_conditions?.trim()) {
    incompleteFields.push("Other Medical Conditions Details");
  }

  return incompleteFields;
};

// Helper function to get total required fields count
export const getTotalRequiredFields = (values: ProfileFormValues) => {
  let total = 20; // Base number of required fields

  // Add conditional fields based on "Other" selections
  if (values.dietary_preferences?.includes("Other")) total++;
  if (values.allergies?.includes("Other")) total++;
  if (values.favorite_cuisines?.includes("Other")) total++;
  if (values.medical_conditions?.includes("Other")) total++;

  return total;
};