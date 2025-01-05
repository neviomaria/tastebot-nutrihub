import { ProfileFormValues } from "@/schemas/profile";

// Helper function to calculate basic info completion (26%)
const getBasicInfoCompletion = (values: ProfileFormValues): number => {
  const requiredFields = [
    !!values.first_name?.trim(),
    !!values.last_name?.trim(),
    !!values.email?.trim(),
    !!values.country?.trim(),
  ];
  
  const completedCount = requiredFields.filter(Boolean).length;
  return Math.round((completedCount / requiredFields.length) * 26);
};

// Helper function to calculate section completion
const getSectionCompletion = (completed: number, total: number, weight: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * weight);
};

export const getIncompleteFields = (values: ProfileFormValues) => {
  const incompleteFields: string[] = [];
  
  // Basic Information (Required)
  if (!values.first_name?.trim()) incompleteFields.push("First Name");
  if (!values.last_name?.trim()) incompleteFields.push("Last Name");
  if (!values.country?.trim()) incompleteFields.push("Country");

  // Personal Information (15%)
  if (!values.weight_kg) incompleteFields.push("Weight");
  if (!values.height_cm) incompleteFields.push("Height");
  if (!values.date_of_birth) incompleteFields.push("Date of Birth");
  if (!values.gender) incompleteFields.push("Gender");

  // Cooking & Meal Preferences (15%)
  if (!values.cooking_skill_level) incompleteFields.push("Cooking Skill Level");
  if (!values.meal_preferences?.length) incompleteFields.push("Meal Preferences");
  if (!values.favorite_cuisines?.length) incompleteFields.push("Favorite Cuisines");

  // Health & Activity (15%)
  if (!values.health_goal) incompleteFields.push("Health Goal");
  if (!values.activity_level) incompleteFields.push("Activity Level");
  if (!values.medical_conditions?.length) incompleteFields.push("Medical Conditions");

  // Dietary Preferences (15%)
  if (!values.dietary_preferences?.length) incompleteFields.push("Dietary Preferences");
  if (!values.allergies?.length) incompleteFields.push("Allergies");
  if (!values.religious_restrictions?.length) incompleteFields.push("Religious Restrictions");

  // Shopping & Planning (14%)
  if (!values.planning_preference) incompleteFields.push("Planning Preference");
  if (!values.grocery_budget) incompleteFields.push("Grocery Budget");
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

// Calculate total completion percentage
export const getProfileCompletion = (values: ProfileFormValues): number => {
  // Basic Info (26%)
  const basicCompletion = getBasicInfoCompletion(values);

  // Personal Information (15%)
  const personalFields = [values.weight_kg, values.height_cm, values.date_of_birth, values.gender];
  const personalCompletion = getSectionCompletion(
    personalFields.filter(Boolean).length,
    personalFields.length,
    15
  );

  // Cooking & Meal Preferences (15%)
  const cookingFields = [
    values.cooking_skill_level,
    values.meal_preferences?.length > 0,
    values.favorite_cuisines?.length > 0
  ];
  const cookingCompletion = getSectionCompletion(
    cookingFields.filter(Boolean).length,
    cookingFields.length,
    15
  );

  // Health & Activity (15%)
  const healthFields = [
    values.health_goal,
    values.activity_level,
    values.medical_conditions?.length > 0
  ];
  const healthCompletion = getSectionCompletion(
    healthFields.filter(Boolean).length,
    healthFields.length,
    15
  );

  // Dietary Preferences (15%)
  const dietaryFields = [
    values.dietary_preferences?.length > 0,
    values.allergies?.length > 0,
    values.religious_restrictions?.length > 0
  ];
  const dietaryCompletion = getSectionCompletion(
    dietaryFields.filter(Boolean).length,
    dietaryFields.length,
    15
  );

  // Shopping & Planning (14%)
  const shoppingFields = [
    values.planning_preference,
    values.grocery_budget,
    values.preferred_grocery_stores?.length > 0
  ];
  const shoppingCompletion = getSectionCompletion(
    shoppingFields.filter(Boolean).length,
    shoppingFields.length,
    14
  );

  // Sum all sections
  return Math.min(
    100,
    basicCompletion +
    personalCompletion +
    cookingCompletion +
    healthCompletion +
    dietaryCompletion +
    shoppingCompletion
  );
};

// Helper function to get total required fields count (for reference)
export const getTotalRequiredFields = (values: ProfileFormValues) => {
  let total = 20; // Base number of required fields

  // Add conditional fields based on "Other" selections
  if (values.dietary_preferences?.includes("Other")) total++;
  if (values.allergies?.includes("Other")) total++;
  if (values.favorite_cuisines?.includes("Other")) total++;
  if (values.medical_conditions?.includes("Other")) total++;

  return total;
};