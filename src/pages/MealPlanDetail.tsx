import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { MealPlanDay } from "@/components/meal-plan/MealPlanDay";

const MealPlanDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ["meal-plan", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_plans")
        .select(`
          *,
          meal_plan_items (
            *,
            recipe:recipes (
              id,
              title,
              prep_time,
              cook_time,
              servings
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Meal plan not found</p>
        </div>
      </div>
    );
  }

  // Group meals by day
  const mealsByDay = mealPlan.meal_plan_items?.reduce((acc: any, item) => {
    if (!acc[item.day_of_week]) {
      acc[item.day_of_week] = [];
    }
    acc[item.day_of_week].push(item);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meal Plan</h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Start: {new Date(mealPlan.start_date).toLocaleDateString()}</span>
          <span>•</span>
          <span>End: {new Date(mealPlan.end_date).toLocaleDateString()}</span>
          {mealPlan.daily_calories && (
            <>
              <span>•</span>
              <span>Target: {mealPlan.daily_calories} calories/day</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(mealsByDay).map(([day, meals]) => (
          <MealPlanDay
            key={day}
            dayNumber={parseInt(day)}
            meals={meals as any}
          />
        ))}
      </div>
    </div>
  );
};

export default MealPlanDetail;