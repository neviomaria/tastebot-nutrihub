import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, medicalConditions } from "@/schemas/profile";
import { CheckboxField } from "@/components/form/CheckboxField";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface MedicalSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const MedicalSection = ({ form }: MedicalSectionProps) => {
  const showOtherField = form.watch("medical_conditions")?.includes("Other");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Medical Information</h3>
      <div className="space-y-6">
        <CheckboxField
          form={form}
          name="medical_conditions"
          label="Medical Conditions"
          options={medicalConditions}
        />

        {showOtherField && (
          <FormField
            control={form.control}
            name="other_medical_conditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Medical Conditions</FormLabel>
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