import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, religiousRestrictions } from "@/schemas/profile";
import { CheckboxField } from "@/components/form/CheckboxField";

interface ReligiousRestrictionsSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const ReligiousRestrictionsSection = ({ form }: ReligiousRestrictionsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Religious or Ethical Restrictions</h3>
      <CheckboxField
        form={form}
        name="religious_restrictions"
        label="Religious or Ethical Restrictions"
        options={religiousRestrictions}
      />
    </div>
  );
};