import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, allergies } from "@/schemas/profile";
import { CheckboxField } from "@/components/form/CheckboxField";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AllergiesSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const AllergiesSection = ({ form }: AllergiesSectionProps) => {
  const showOtherField = form.watch("allergies")?.includes("Other");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Allergies</h3>
      <div className="space-y-6">
        <CheckboxField
          form={form}
          name="allergies"
          label="Allergies"
          options={allergies}
        />

        {showOtherField && (
          <FormField
            control={form.control}
            name="other_allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Allergies</FormLabel>
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