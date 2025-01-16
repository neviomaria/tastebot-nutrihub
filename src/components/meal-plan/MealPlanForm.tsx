import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/form/SelectField";
import { CheckboxField } from "@/components/form/CheckboxField";
import { CreateMealPlanFormValues } from "@/schemas/meal-plan";
import { mealPlanObjectives, mealPlanDurations, mealsPerDay, timeConstraints } from "@/schemas/meal-plan";
import { allergies, cuisineTypes } from "@/schemas/profile";

interface MealPlanFormProps {
  form: UseFormReturn<CreateMealPlanFormValues>;
  onSubmit: (values: CreateMealPlanFormValues) => void;
  userBooks: { book_id: string; book_title: string; }[];
}

export const MealPlanForm = ({ form, onSubmit, userBooks }: MealPlanFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SelectField
          form={form}
          name="objective"
          label="Primary Objective"
          options={mealPlanObjectives}
        />

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

        <SelectField
          form={form}
          name="time_constraint"
          label="Time Constraint"
          options={timeConstraints}
        />

        <div className="space-y-4">
          <Input
            type="date"
            {...form.register("start_date")}
            aria-label="Start Date"
          />
          <Input
            type="date"
            {...form.register("end_date")}
            aria-label="End Date"
          />
          <Input
            type="number"
            {...form.register("daily_calories", { valueAsNumber: true })}
            placeholder="Daily Calories Target"
          />
        </div>

        <CheckboxField
          form={form}
          name="excluded_ingredients"
          label="Excluded Ingredients"
          options={allergies.filter(allergy => allergy !== "Other")}
        />

        <CheckboxField
          form={form}
          name="preferred_cuisines"
          label="Preferred Cuisines"
          options={cuisineTypes.filter(cuisine => cuisine !== "Other")}
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
          <Button type="submit" className="w-full">
            Create Plan
          </Button>
        </div>
      </form>
    </Form>
  );
};