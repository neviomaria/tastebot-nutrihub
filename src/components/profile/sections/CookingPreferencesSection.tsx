import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, cookingSkillLevels, mealPreferences } from "@/schemas/profile";
import { SelectField } from "@/components/form/SelectField";
import { CheckboxField } from "@/components/form/CheckboxField";

interface CookingPreferencesSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const CookingPreferencesSection = ({ form }: CookingPreferencesSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Cooking Preferences</h3>
      <div className="space-y-6">
        <SelectField
          form={form}
          name="cooking_skill_level"
          label="Cooking Skill Level"
          options={cookingSkillLevels}
        />
        
        <CheckboxField
          form={form}
          name="meal_preferences"
          label="Meal Preferences"
          options={mealPreferences}
        />
      </div>
    </div>
  );
};