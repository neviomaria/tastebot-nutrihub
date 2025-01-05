import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileData } from "@/hooks/profile/use-profile-data";
import { useForm } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";
import { getIncompleteFields, getProfileCompletion } from "@/hooks/profile/use-profile-validation";
import { ArrowRight, AlertCircle } from "lucide-react";

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
      return value.length === 0;
    }
    
    // Handle all other fields
    return !value;
  });
  
  const percentage = getProfileCompletion(values);
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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

            <p className="text-center text-muted-foreground text-sm max-w-[280px]">
              Complete your profile to unlock personalized recipe recommendations
            </p>
          </div>

          {/* Right Column - Missing Information */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Missing Information</h3>
            </div>
            
            <div className="space-y-3 mb-6 bg-purple-50/50 p-4 rounded-lg">
              {incompleteFields.slice(0, 4).map((field, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                  {field}
                </div>
              ))}
              {incompleteFields.length > 4 && (
                <div 
                  className="text-sm text-primary/80 font-medium animate-fade-in pl-3.5"
                  style={{ animationDelay: '400ms' }}
                >
                  And {incompleteFields.length - 4} more fields to complete...
                </div>
              )}
            </div>

            <Button
              onClick={() => navigate("/profile")}
              className="w-full bg-primary hover:bg-primary-hover text-white group transition-all duration-300"
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