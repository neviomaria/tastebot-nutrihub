import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoFields } from "./BasicInfoFields";
import { DietarySection } from "./sections/DietarySection";
import { AllergiesSection } from "./sections/AllergiesSection";
import { CookingPreferencesSection } from "./sections/CookingPreferencesSection";
import { CuisineSection } from "./sections/CuisineSection";
import { HealthSection } from "./sections/HealthSection";
import { ActivitySection } from "./sections/ActivitySection";
import { MedicalSection } from "./sections/MedicalSection";
import { PlanningSection } from "./sections/PlanningSection";
import { ShoppingPreferencesSection } from "./sections/ShoppingPreferencesSection";
import { ReligiousRestrictionsSection } from "./sections/ReligiousRestrictionsSection";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";

interface ProfileFormTabsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const ProfileFormTabs = ({ form }: ProfileFormTabsProps) => {
  return (
    <>
      <TabsList className="w-full overflow-x-auto flex flex-nowrap">
        <TabsTrigger value="profile" className="flex-shrink-0">Profile*</TabsTrigger>
        <TabsTrigger value="dietary" className="flex-shrink-0">Dietary Preferences</TabsTrigger>
        <TabsTrigger value="cooking" className="flex-shrink-0">Cooking Preferences</TabsTrigger>
        <TabsTrigger value="medical" className="flex-shrink-0">Medical Information</TabsTrigger>
        <TabsTrigger value="shopping" className="flex-shrink-0">Shopping Preferences</TabsTrigger>
        <TabsTrigger value="religious" className="flex-shrink-0">Religious or Ethical</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">* Required fields</p>
          <BasicInfoFields form={form} />
        </div>
      </TabsContent>

      <TabsContent value="dietary" className="mt-6">
        <div className="space-y-6">
          <DietarySection form={form} />
          <AllergiesSection form={form} />
        </div>
      </TabsContent>

      <TabsContent value="cooking" className="mt-6">
        <div className="space-y-6">
          <CookingPreferencesSection form={form} />
          <CuisineSection form={form} />
        </div>
      </TabsContent>

      <TabsContent value="medical" className="mt-6">
        <div className="space-y-6">
          <HealthSection form={form} />
          <ActivitySection form={form} />
          <MedicalSection form={form} />
        </div>
      </TabsContent>

      <TabsContent value="shopping" className="mt-6">
        <div className="space-y-6">
          <PlanningSection form={form} />
          <ShoppingPreferencesSection form={form} />
        </div>
      </TabsContent>

      <TabsContent value="religious" className="mt-6">
        <ReligiousRestrictionsSection form={form} />
      </TabsContent>
    </>
  );
};