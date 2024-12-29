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
      dietary_preferences: [],
      allergies: [],
      health_goal: "General Health",
      activity_level: "Moderately Active",
      planning_preference: "Weekly Planning",
      favorite_cuisines: [],
      other_dietary_preferences: "",
      other_allergies: "",
      other_cuisines: "",
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
          dietary_preferences: values.dietary_preferences.includes("Other") 
            ? [...values.dietary_preferences, values.other_dietary_preferences]
            : values.dietary_preferences,
          allergies: values.allergies.includes("Other")
            ? [...values.allergies, values.other_allergies]
            : values.allergies,
          favorite_cuisines: values.favorite_cuisines.includes("Other")
            ? [...values.favorite_cuisines, values.other_cuisines]
            : values.favorite_cuisines,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfoFields form={form} />
        <PreferencesFields form={form} />

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