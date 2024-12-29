import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, genderOptions } from "@/schemas/profile";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/form/SelectField";

interface PersonalInfoSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const PersonalInfoSection = ({ form }: PersonalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="weight_kg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="70"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="height_cm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="170"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SelectField
          form={form}
          name="gender"
          label="Gender"
          options={genderOptions}
        />
      </div>
    </div>
  );
};