import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileData } from "@/hooks/profile/use-profile-data";
import { useForm } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";
import { getProfileCompletion } from "@/hooks/profile/use-profile-validation";
import { ArrowRight } from "lucide-react";

export const ProfileCompletionWidget = () => {
  console.log("[ProfileCompletionWidget] Starting render");
  const navigate = useNavigate();
  const form = useForm<ProfileFormValues>();
  
  useProfileData(form);
  
  const values = form.getValues();
  console.log("[ProfileCompletionWidget] Profile values:", values);
  const percentage = getProfileCompletion(values);
  console.log("[ProfileCompletionWidget] Profile completion percentage:", percentage);
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  console.log("[ProfileCompletionWidget] Rendering component");
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-purple-50/30 shadow-sm hover:shadow transition-all duration-300">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Profile Completion */}
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-xl font-semibold text-foreground/90">Profile Completion</h2>
            
            {/* Circular Progress */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  className="text-purple-100 stroke-[8]"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                {/* Progress circle */}
                <circle
                  className="text-primary stroke-[8] transition-all duration-1000 ease-in-out"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                  }}
                />
              </svg>
              {/* Percentage text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-primary">{percentage}%</span>
                <span className="text-sm text-muted-foreground mt-1">Complete</span>
              </div>
            </div>
          </div>

          {/* Right Column - Call to Action */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-center text-muted-foreground text-sm max-w-[280px]">
              Complete your profile to unlock personalized recipe recommendations
            </p>
            
            <Button
              onClick={() => navigate("/profile")}
              className="w-[280px] bg-primary hover:bg-primary-hover text-white group transition-all duration-300"
            >
              Complete Profile
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};