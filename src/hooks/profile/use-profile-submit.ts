import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormValues } from "@/schemas/profile";
import { getIncompleteFields } from "./use-profile-validation";

export const useProfileSubmit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      console.log("Starting profile update with values:", values);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        throw userError;
      }
      
      if (!user) {
        console.error("No user found");
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to complete your profile",
          duration: 5000,
          className: "bg-gradient-to-r from-red-500/80 to-pink-500/80 text-white border-none",
        });
        return;
      }

      // Show loading toast
      const loadingToast = toast({
        title: "Saving...",
        description: "Your profile is being updated",
        className: "bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white border-none",
      });

      console.log("Updating profile for user:", user.id);

      // Clean up allergies array - if it contains "None" or is empty, set to null
      const cleanedAllergies = values.allergies?.length 
        ? values.allergies[0] === "None" ? null : values.allergies
        : null;

      const updateData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || user.email || "",
        avatar_url: values.avatar_url || null,
        country: values.country,
        dietary_preferences: values.dietary_preferences?.length ? values.dietary_preferences : null,
        allergies: cleanedAllergies,
        favorite_cuisines: values.favorite_cuisines?.length ? values.favorite_cuisines : null,
        meal_preferences: values.meal_preferences?.length ? values.meal_preferences : null,
        medical_conditions: values.medical_conditions?.length ? values.medical_conditions : null,
        preferred_grocery_stores: values.preferred_grocery_stores?.length ? values.preferred_grocery_stores : null,
        religious_restrictions: values.religious_restrictions?.length ? values.religious_restrictions : null,
        health_goal: values.health_goal || null,
        activity_level: values.activity_level || null,
        planning_preference: values.planning_preference || null,
        other_dietary_preferences: values.dietary_preferences?.includes("Other") 
          ? values.other_dietary_preferences 
          : null,
        other_allergies: values.allergies?.includes("Other") 
          ? values.other_allergies 
          : null,
        other_cuisines: values.favorite_cuisines?.includes("Other") 
          ? values.other_cuisines 
          : null,
        other_medical_conditions: values.medical_conditions?.includes("Other")
          ? values.other_medical_conditions
          : null,
        weight_kg: values.weight_kg || null,
        height_cm: values.height_cm || null,
        date_of_birth: values.date_of_birth || null,
        gender: values.gender || null,
        cooking_skill_level: values.cooking_skill_level || null,
        grocery_budget: values.grocery_budget || null,
      };

      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select();

      if (updateError) {
        console.error("Supabase update error:", updateError);
        loadingToast.dismiss();
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update profile: " + updateError.message,
          duration: 5000,
        });
        return;
      }

      // Dismiss loading toast
      loadingToast.dismiss();

      // Get incomplete fields
      const incompleteFields = getIncompleteFields(values);
      
      // Show simplified success message
      if (incompleteFields.length > 0) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been saved. Some optional information is still missing.",
          duration: 4000,
          className: "bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white border-none",
        });
      } else {
        toast({
          title: "Profile Complete!",
          description: "All information has been saved successfully.",
          duration: 4000,
          className: "bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white border-none",
        });
      }

      // Wait a bit for the toast to be visible before navigating
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
        duration: 5000,
        className: "bg-gradient-to-r from-red-500/80 to-pink-500/80 text-white border-none",
      });
    }
  };

  return onSubmit;
};