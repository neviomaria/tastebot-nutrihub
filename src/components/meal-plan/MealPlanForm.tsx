import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SelectField } from "@/components/form/SelectField";
import { CheckboxField } from "@/components/form/CheckboxField";
import { CreateMealPlanFormValues } from "@/schemas/meal-plan";
import { mealPlanDurations, mealsPerDay } from "@/schemas/meal-plan";
import { Loader2 } from "lucide-react";

interface MealPlanFormProps {
  form: UseFormReturn<CreateMealPlanFormValues>;
  onSubmit: (values: CreateMealPlanFormValues) => void;
  userBooks: { book_id: string; book_title: string; }[];
  isGenerating?: boolean;
}

// Helper function to format meal type for display
const formatMealType = (type: string) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const MealPlanForm = ({ form, onSubmit, userBooks, isGenerating }: MealPlanFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectField
          form={form}
          name="duration"
          label="Plan Duration"
          options={mealPlanDurations}
        />

        <CheckboxField
          form={form}
          name="meals_per_day"
          label="Meals Per Day"
          options={mealsPerDay}
        />

        {userBooks.length > 0 && (
          <CheckboxField
            form={form}
            name="selected_books"
            label="Select Books for Recipes"
            options={userBooks.map(book => book.book_title)}
          />
        )}

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              'Create Plan'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};