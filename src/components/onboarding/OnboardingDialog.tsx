import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const steps = [ 
  {
    title: "Welcome to Your Recipe Assistant!",
    description: "Let's take a quick tour of the key features to help you get started.",
  },
  {
    title: "Create Your Profile",
    description: "Set up your dietary preferences, allergies, and cooking preferences to get personalized recommendations.",
  },
  {
    title: "Meal Planning Made Easy",
    description: "Generate personalized meal plans based on your preferences and nutritional goals.",
  },
  {
    title: "Recipe Management",
    description: "Save your favorite recipes and create custom timers for cooking.",
  },
  {
    title: "Ready to Start!",
    description: "You're all set to explore and enjoy your personalized cooking experience.",
  },
];

export const OnboardingDialog = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      setOpen(true);
    }
  }, [profile]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (error) throw error;

      setOpen(false);
      refetch();
      
      toast({
        title: "Welcome aboard!",
        description: "Let's start by completing your profile.",
      });
      
      navigate("/profile");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription className="pt-2">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="h-[200px] flex items-center justify-center">
          {/* Add illustrations or screenshots here */}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Get Started
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
