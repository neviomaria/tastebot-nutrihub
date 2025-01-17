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
      <div className="flex items-center justify-center h-[calc(100vh-40px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600">Meal plan not found</p>
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
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h1 className="text-lg font-semibold mb-1">Meal Plan</h1>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
            <span>Start: {new Date(mealPlan.start_date).toLocaleDateString()}</span>
            <span>•</span>
            <span>End: {new Date(mealPlan.end_date).toLocaleDateString()}</span>
            {mealPlan.daily_calories && (
              <>
                <span>•</span>
                <span>{mealPlan.daily_calories} calories/day</span>
              </>
            )}
          </div>

          <div className="space-y-4">
            {Object.entries(mealsByDay).map(([day, meals]) => (
              <MealPlanDay
                key={day}
                dayNumber={parseInt(day)}
                meals={meals as any}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanDetail;