import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const ProfileCompletionWidget = () => {
  const { data: profile } = useQuery({
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

  const calculateCompletion = () => {
    if (!profile) return 0;
    
    const fields = [
      'first_name',
      'last_name',
      'country',
      'health_goal',
      'activity_level',
      'dietary_preferences',
      'allergies',
      'favorite_cuisines',
      'cooking_skill_level',
      'meal_preferences'
    ];
    
    const completedFields = fields.filter(field => {
      const value = profile[field];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    });
    
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const completion = calculateCompletion();

  return (
    <Link to="/profile">
      <Card className="w-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold gradient-text">Profile Completion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {completion}% Complete
            </span>
            <span className="text-sm font-medium text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1">
              {completion < 100 ? 'Complete your profile →' : 'View your profile →'}
            </span>
          </div>
          <Progress 
            value={completion} 
            className="h-2 bg-secondary"
            indicatorClassName="bg-gradient-to-r from-purple-600 to-blue-600"
          />
        </CardContent>
      </Card>
    </Link>
  );
};