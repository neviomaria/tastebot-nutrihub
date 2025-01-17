import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
              servings,
              ingredients,
              instructions,
              acf (
                recipe_image (
                  url
                )
              )
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
    return <div>Meal plan not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Meal Plan Details</h1>
      
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Plan Overview</h2>
          <div className="grid gap-2">
            <p><span className="font-medium">Start Date:</span> {new Date(mealPlan.start_date).toLocaleDateString()}</p>
            <p><span className="font-medium">End Date:</span> {new Date(mealPlan.end_date).toLocaleDateString()}</p>
            <p><span className="font-medium">Duration:</span> {mealPlan.duration}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Meal Schedule</h2>
          {mealPlan.meal_plan_items?.map((item) => (
            <div key={item.id} className="border-b py-4 last:border-b-0">
              <h3 className="font-medium">Day {item.day_of_week} - {item.meal_type}</h3>
              <div className="mt-2 flex gap-4">
                {item.recipe?.acf?.recipe_image?.url && (
                  <img 
                    src={item.recipe.acf.recipe_image.url}
                    alt={item.recipe.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="text-lg">{item.recipe?.title}</p>
                  <p className="text-sm text-gray-600">
                    Prep: {item.recipe?.prep_time} | Cook: {item.recipe?.cook_time} | Servings: {item.servings}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlanDetail;