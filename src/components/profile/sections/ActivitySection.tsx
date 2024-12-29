import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, activityLevels } from "@/schemas/profile";
import { SelectField } from "@/components/form/SelectField";

interface ActivitySectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const ActivitySection = ({ form }: ActivitySectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity Level</h3>
      <SelectField
        form={form}
        name="activity_level"
        label="Activity Level"
        options={activityLevels}
      />
    </div>
  );
};