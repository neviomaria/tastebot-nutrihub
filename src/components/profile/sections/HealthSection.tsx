import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, healthGoals } from "@/schemas/profile";
import { SelectField } from "@/components/form/SelectField";

interface HealthSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const HealthSection = ({ form }: HealthSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Health Goals</h3>
      <SelectField
        form={form}
        name="health_goal"
        label="Health Goals"
        options={healthGoals}
      />
    </div>
  );
};