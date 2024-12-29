import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, groceryBudgets } from "@/schemas/profile";
import { SelectField } from "@/components/form/SelectField";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ShoppingPreferencesSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const ShoppingPreferencesSection = ({ form }: ShoppingPreferencesSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Shopping Preferences</h3>
      <div className="space-y-6">
        <SelectField
          form={form}
          name="grocery_budget"
          label="Grocery Budget"
          options={groceryBudgets}
        />

        <FormField
          control={form.control}
          name="preferred_grocery_stores"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Grocery Stores</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter store names separated by commas"
                  {...field}
                  onChange={(e) => {
                    const stores = e.target.value.split(',').map(store => store.trim());
                    field.onChange(stores);
                  }}
                  value={field.value?.join(', ') || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};