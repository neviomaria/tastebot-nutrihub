import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateMealPlanDialog } from "@/components/meal-plan/CreateMealPlanDialog";
import { Button } from "@/components/ui/button";

const MealPlans = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mealPlans, isLoading } = useQuery({
    queryKey: ["meal-plans"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

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
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meal Plans</h1>
          <CreateMealPlanDialog onSuccess={handleSuccess} />
        </div>

        {mealPlans?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No meal plans yet</h3>
            <p className="text-muted-foreground">
              Create your first meal plan to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {mealPlans?.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-sm p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {new Date(plan.start_date).toLocaleDateString()} -{" "}
                      {new Date(plan.end_date).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.daily_calories} calories per day
                    </p>
                  </div>
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlans;