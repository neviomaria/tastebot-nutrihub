import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { profileSchema, type ProfileFormValues } from "@/schemas/profile";
import { useEffect } from "react";

export const useProfileForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      avatar_url: "",
      country: "",
      dietary_preferences: [],
      allergies: [],
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
  });

  // Fetch and set initial form data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to view your profile",
          });
          navigate("/auth");
          return;
        }

        // First set the email from auth
        form.setValue("email", user.email || "");

        // Then fetch the rest of the profile data
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        if (profile) {
          // Update all form fields with profile data
          Object.entries(profile).forEach(([key, value]) => {
            if (key in form.getValues()) {
              form.setValue(key as keyof ProfileFormValues, value);
            }
          });
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    fetchProfileData();
  }, [form, navigate, toast]);

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
        });
        return;
      }

      console.log("Updating profile for user:", user.id);

      const updateData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        avatar_url: values.avatar_url || null,
        country: values.country,
        dietary_preferences: values.dietary_preferences?.length ? values.dietary_preferences : null,
        allergies: values.allergies?.length ? values.allergies : null,
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

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select();

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully!",
      });

      navigate("/");
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  return { form, onSubmit };
};