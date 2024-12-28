import { SelectField } from "@/components/form/SelectField";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import {
  ProfileFormValues,
  dietaryPreferences,
  activityLevels,
  healthGoals,
  planningPreferences,
  cuisineTypes,
} from "@/schemas/profile";

interface PreferencesFieldsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const PreferencesFields = ({ form }: PreferencesFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SelectField
        form={form}
        name="dietary_preferences"
        label="Dietary Preferences"
        options={dietaryPreferences}
      />

      <FormField
        control={form.control}
        name="allergies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Allergies</FormLabel>
            <FormControl>
              <Input placeholder="e.g., nuts, dairy (optional)" {...field} />
            </FormControl>
            <FormDescription>
              List any food allergies, separated by commas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <SelectField
        form={form}
        name="health_goal"
        label="Primary Health Goal"
        options={healthGoals}
      />

      <SelectField
        form={form}
        name="activity_level"
        label="Activity Level"
        options={activityLevels}
      />

      <SelectField
        form={form}
        name="planning_preference"
        label="Meal Planning Preference"
        options={planningPreferences}
      />

      <SelectField
        form={form}
        name="favorite_cuisines"
        label="Favorite Cuisine"
        options={cuisineTypes}
      />
    </div>
  );
};