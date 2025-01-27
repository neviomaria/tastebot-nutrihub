import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { MealPlanDay } from "@/components/meal-plan/MealPlanDay";
import { Button } from "@/components/ui/button";

const MealPlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch all user's meal plans to enable navigation
  const { data: allMealPlans } = useQuery({
    queryKey: ["meal-plans"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("meal_plans")
        .select("id, start_date")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ["meal-plan", id],
    queryFn: async () => {
      if (!id) return null;

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
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const currentIndex = allMealPlans?.findIndex(plan => plan.id === id) ?? -1;
  const previousPlan = currentIndex > 0 ? allMealPlans?.[currentIndex - 1] : null;
  const nextPlan = currentIndex < (allMealPlans?.length ?? 0) - 1 ? allMealPlans?.[currentIndex + 1] : null;

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

  // Create an array of all days with their meals for navigation
  const allDaysMeals = Object.entries(mealsByDay).map(([day, meals]) => ({
    dayNumber: parseInt(day),
    meals: meals as any[]
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => previousPlan && navigate(`/meal-plan/${previousPlan.id}`)}
            disabled={!previousPlan}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {mealPlan.title || `Meal Plan (${new Date(mealPlan.start_date).toLocaleDateString()} - ${new Date(mealPlan.end_date).toLocaleDateString()})`}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => nextPlan && navigate(`/meal-plan/${nextPlan.id}`)}
            disabled={!nextPlan}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
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
            allDaysMeals={allDaysMeals}
          />
        ))}
      </div>
    </div>
  );
};

export default MealPlanDetail;