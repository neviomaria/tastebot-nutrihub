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
    const value = values[fieldKey as keyof ProfileFormValues];
    
    // Handle array fields
    if (Array.isArray(value)) {
      return !value.length;
    }
    
    // Handle all other fields
    return !value;
  });
  
  const percentage = getProfileCompletion(values);
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="overflow-hidden bg-white shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Profile Completion */}
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-xl font-semibold">Profile Completion</h2>
            
            {/* Circular Progress */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  className="text-muted/10 stroke-[8]"
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
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary">{percentage}%</span>
              </div>
            </div>

            <p className="text-center text-muted-foreground text-sm">
              Complete your profile to get personalized recipe recommendations
            </p>
          </div>

          {/* Right Column - Missing Information */}
          <div className="flex flex-col">
            <h3 className="text-lg font-medium mb-4">Missing Information</h3>
            
            <div className="space-y-2 mb-6">
              {incompleteFields.slice(0, 4).map((field, index) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground"
                >
                  {field}
                </div>
              ))}
              {incompleteFields.length > 4 && (
                <div className="text-sm text-muted-foreground">
                  And {incompleteFields.length - 4} more...
                </div>
              )}
            </div>

            <Button
              onClick={() => navigate("/profile")}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              Complete Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};