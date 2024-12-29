import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";
import { DietarySection } from "./sections/DietarySection";
import { AllergiesSection } from "./sections/AllergiesSection";
import { HealthSection } from "./sections/HealthSection";
import { ActivitySection } from "./sections/ActivitySection";
import { PlanningSection } from "./sections/PlanningSection";
import { CuisineSection } from "./sections/CuisineSection";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { CookingPreferencesSection } from "./sections/CookingPreferencesSection";
import { MedicalSection } from "./sections/MedicalSection";
import { ShoppingPreferencesSection } from "./sections/ShoppingPreferencesSection";
import { ReligiousRestrictionsSection } from "./sections/ReligiousRestrictionsSection";

interface PreferencesFieldsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const PreferencesFields = ({ form }: PreferencesFieldsProps) => {
  return (
    <div className="space-y-8">
      <PersonalInfoSection form={form} />
      <DietarySection form={form} />
      <AllergiesSection form={form} />
      <HealthSection form={form} />
      <ActivitySection form={form} />
      <CookingPreferencesSection form={form} />
      <MedicalSection form={form} />
      <ShoppingPreferencesSection form={form} />
      <ReligiousRestrictionsSection form={form} />
      <PlanningSection form={form} />
      <CuisineSection form={form} />
    </div>
  );
};