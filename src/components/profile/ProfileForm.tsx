import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { profileSchema, type ProfileFormValues } from "@/schemas/profile";
import { BasicInfoFields } from "./BasicInfoFields";
import { PreferencesFields } from "./PreferencesFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DietarySection } from "./sections/DietarySection";
import { AllergiesSection } from "./sections/AllergiesSection";
import { CookingPreferencesSection } from "./sections/CookingPreferencesSection";
import { CuisineSection } from "./sections/CuisineSection";
import { HealthSection } from "./sections/HealthSection";
import { ActivitySection } from "./sections/ActivitySection";
import { MedicalSection } from "./sections/MedicalSection";
import { PlanningSection } from "./sections/PlanningSection";
import { ShoppingPreferencesSection } from "./sections/ShoppingPreferencesSection";
import { ReligiousRestrictionsSection } from "./sections/ReligiousRestrictionsSection";

export const ProfileForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
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

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to complete your profile",
        });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          ...values,
          dietary_preferences: values.dietary_preferences,
          allergies: values.allergies,
          favorite_cuisines: values.favorite_cuisines,
          meal_preferences: values.meal_preferences,
          medical_conditions: values.medical_conditions,
          preferred_grocery_stores: values.preferred_grocery_stores,
          religious_restrictions: values.religious_restrictions,
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
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Welcome to your personalized nutrition journey!",
      });

      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full overflow-x-auto flex flex-nowrap">
            <TabsTrigger value="profile" className="flex-shrink-0">Profile</TabsTrigger>
            <TabsTrigger value="dietary" className="flex-shrink-0">Dietary Preferences</TabsTrigger>
            <TabsTrigger value="cooking" className="flex-shrink-0">Cooking Preferences</TabsTrigger>
            <TabsTrigger value="medical" className="flex-shrink-0">Medical Information</TabsTrigger>
            <TabsTrigger value="shopping" className="flex-shrink-0">Shopping Preferences</TabsTrigger>
            <TabsTrigger value="religious" className="flex-shrink-0">Religious or Ethical</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <BasicInfoFields form={form} />
          </TabsContent>

          <TabsContent value="dietary" className="mt-6">
            <div className="space-y-6">
              <DietarySection form={form} />
              <AllergiesSection form={form} />
            </div>
          </TabsContent>

          <TabsContent value="cooking" className="mt-6">
            <div className="space-y-6">
              <CookingPreferencesSection form={form} />
              <CuisineSection form={form} />
            </div>
          </TabsContent>

          <TabsContent value="medical" className="mt-6">
            <div className="space-y-6">
              <HealthSection form={form} />
              <ActivitySection form={form} />
              <MedicalSection form={form} />
            </div>
          </TabsContent>

          <TabsContent value="shopping" className="mt-6">
            <div className="space-y-6">
              <PlanningSection form={form} />
              <ShoppingPreferencesSection form={form} />
            </div>
          </TabsContent>

          <TabsContent value="religious" className="mt-6">
            <ReligiousRestrictionsSection form={form} />
          </TabsContent>
        </Tabs>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          Complete Profile
        </Button>
      </form>
    </Form>
  );
};