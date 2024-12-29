import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, planningPreferences } from "@/schemas/profile";
import { SelectField } from "@/components/form/SelectField";

interface PlanningSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const PlanningSection = ({ form }: PlanningSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Planning Preferences</h3>
      <SelectField
        form={form}
        name="planning_preference"
        label="Planning Preference"
        options={planningPreferences}
      />
    </div>
  );
};