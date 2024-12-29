import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, cuisineTypes } from "@/schemas/profile";
import { CheckboxField } from "@/components/form/CheckboxField";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CuisineSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const CuisineSection = ({ form }: CuisineSectionProps) => {
  const showOtherField = form.watch("favorite_cuisines")?.includes("Other");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Favorite Cuisines</h3>
      <div className="space-y-6">
        <CheckboxField
          form={form}
          name="favorite_cuisines"
          label="Cuisines"
          options={cuisineTypes}
        />

        {showOtherField && (
          <FormField
            control={form.control}
            name="other_cuisines"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Cuisines</FormLabel>
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