import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateMealPlanDialog } from "@/components/meal-plan/CreateMealPlanDialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MealPlans = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
  };

  const handleDelete = async (planId: string) => {
    try {
      // First delete related meal plan items
      const { error: itemsError } = await supabase
        .from('meal_plan_items')
        .delete()
        .eq('meal_plan_id', planId);

      if (itemsError) throw itemsError;

      // Then delete the meal plan
      const { error: planError } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId);

      if (planError) throw planError;

      toast({
        title: "Success",
        description: "Meal plan deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete meal plan",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

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
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/meal-plan/${plan.id}`)}
                    >
                      View Details
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Meal Plan</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this meal plan? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(plan.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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