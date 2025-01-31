import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormValues } from "@/schemas/profile";

export const useProfileData = (form: UseFormReturn<ProfileFormValues>) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

        // First set the email from auth - IMPORTANT: ensure it's never null
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
              // Ensure email is never set to null
              if (key === 'email') {
                form.setValue(key as keyof ProfileFormValues, value || user.email || "");
              } else {
                form.setValue(key as keyof ProfileFormValues, value);
              }
            }
          });
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    fetchProfileData();
  }, [form, navigate, toast]);
};