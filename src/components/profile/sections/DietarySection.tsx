import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, dietaryPreferences } from "@/schemas/profile";
import { CheckboxField } from "@/components/form/CheckboxField";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface DietarySectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const DietarySection = ({ form }: DietarySectionProps) => {
  const showOtherField = form.watch("dietary_preferences")?.includes("Other");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dietary Preferences</h3>
      <div className="space-y-6">
        <CheckboxField
          form={form}
          name="dietary_preferences"
          label="Dietary Preferences"
          options={dietaryPreferences}
        />

        {showOtherField && (
          <FormField
            control={form.control}
            name="other_dietary_preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Dietary Preferences</FormLabel>
                <FormControl>
                  <Input placeholder="Please specify" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};