import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileData } from "@/hooks/profile/use-profile-data";
import { useForm } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";
import { getIncompleteFields, getProfileCompletion } from "@/hooks/profile/use-profile-validation";
import { ArrowRight } from "lucide-react";

export const ProfileCompletionWidget = () => {
  const navigate = useNavigate();
  const form = useForm<ProfileFormValues>();
  
  useProfileData(form);
  
  const values = form.getValues();
  const incompleteFields = getIncompleteFields(values).filter(field => {
    const fieldKey = field.toLowerCase().replace(/ /g, '_');
    // Special handling for arrays
    if (Array.isArray(values[fieldKey as keyof ProfileFormValues])) {
      return !values[fieldKey as keyof ProfileFormValues]?.length;
    }
    // Handle regular fields
    return !values[fieldKey as keyof ProfileFormValues];
  });
  
  const percentage = getProfileCompletion(values);
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Profile Completion */}
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-xl font-semibold">Profile Completion</h2>
            
            {/* Circular Progress */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  className="text-muted/20 stroke-[8]"
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
                <span className="text-sm text-muted-foreground">Complete</span>
              </div>
            </div>

            <p className="text-center text-muted-foreground text-sm max-w-[250px]">
              Complete your profile to get personalized recipe recommendations
            </p>
          </div>

          {/* Right Column - Missing Information */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Missing Information</h3>
              
              <div className="space-y-2">
                {incompleteFields.slice(0, 4).map((field, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground animate-fade-in pl-3.5"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {field}
                  </div>
                ))}
                {incompleteFields.length > 4 && (
                  <div className="text-sm text-muted-foreground animate-fade-in pl-3.5"
                       style={{ animationDelay: '400ms' }}>
                    And {incompleteFields.length - 4} more...
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => navigate("/profile")}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-white group"
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