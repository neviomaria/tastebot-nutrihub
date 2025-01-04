import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfileData } from "@/hooks/profile/use-profile-data";
import { useForm } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";
import { getIncompleteFields } from "@/hooks/profile/use-profile-validation";

export const ProfileCompletionWidget = () => {
  const navigate = useNavigate();
  const form = useForm<ProfileFormValues>();
  
  // Load profile data
  useProfileData(form);
  
  const values = form.getValues();
  const incompleteFields = getIncompleteFields(values);
  const totalFields = 16; // Total number of required fields
  const completedFields = totalFields - incompleteFields.length;
  const percentage = Math.round((completedFields / totalFields) * 100);
  
  const circumference = 2 * Math.PI * 45; // Circle radius is 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Circular Progress */}
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-gray-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="45"
                cx="50"
                cy="50"
              />
              {/* Progress circle */}
              <circle
                className="text-primary transition-all duration-1000 ease-in-out"
                strokeWidth="8"
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
              <span className="text-sm text-gray-500">Complete</span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold gradient-text">Profile Completion</h2>
            
            {incompleteFields.length > 0 ? (
              <>
                <p className="text-muted-foreground">
                  Complete your profile to get personalized recipe recommendations
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Missing information:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {incompleteFields.slice(0, 3).map((field, index) => (
                      <li key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        {field}
                      </li>
                    ))}
                    {incompleteFields.length > 3 && (
                      <li className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                        And {incompleteFields.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
                <Button
                  onClick={() => navigate("/profile")}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Complete Profile
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">
                  Your profile is complete! You're all set to receive personalized recommendations.
                </p>
                <Button
                  onClick={() => navigate("/profile")}
                  variant="outline"
                  className="w-full"
                >
                  View Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};