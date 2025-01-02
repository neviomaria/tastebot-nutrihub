import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/schemas/profile";
import { useProfileData } from "./profile/use-profile-data";
import { useProfileSubmit } from "./profile/use-profile-submit";

export const useProfileForm = () => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      avatar_url: "",
      country: "",
      dietary_preferences: [],
      allergies: [], // This is optional
      health_goal: undefined,
      activity_level: undefined,
      planning_preference: undefined,
      favorite_cuisines: [],
      other_dietary_preferences: "",
      other_allergies: "",
      other_cuisines: "",
      weight_kg: undefined,
      height_cm: undefined,
      date_of_birth: "",
      gender: undefined,
      cooking_skill_level: undefined,
      meal_preferences: [],
      medical_conditions: [],
      other_medical_conditions: "",
      preferred_grocery_stores: [],
      grocery_budget: undefined,
      religious_restrictions: [],
    },
    mode: "onChange", // This will help with immediate validation feedback
  });

  // Initialize form data
  useProfileData(form);

  // Get submit handler
  const onSubmit = useProfileSubmit();

  return { form, onSubmit };
};