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
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileFormTabsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const ProfileFormTabs = ({ form }: ProfileFormTabsProps) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const tabs = [
    { value: "profile", label: "Profile*" },
    { value: "dietary", label: "Dietary" },
    { value: "cooking", label: "Cooking" },
    { value: "medical", label: "Medical" },
    { value: "shopping", label: "Shopping" },
    { value: "religious", label: "Religious" }
  ];

  const handleNext = () => {
    if (currentTabIndex < tabs.length - 1) {
      setCurrentTabIndex(currentTabIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentTabIndex > 0) {
      setCurrentTabIndex(currentTabIndex - 1);
    }
  };

  return (
    <>
      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <TabsList className="w-full">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-2 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentTabIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="font-medium">
            {tabs[currentTabIndex].label}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentTabIndex === tabs.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-full overflow-x-hidden px-1">
        <TabsContent value="profile" className="mt-6" hidden={currentTabIndex !== 0}>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">* Required fields</p>
            <BasicInfoFields form={form} />
          </div>
        </TabsContent>

        <TabsContent value="dietary" className="mt-6" hidden={currentTabIndex !== 1}>
          <div className="space-y-6">
            <DietarySection form={form} />
            <AllergiesSection form={form} />
          </div>
        </TabsContent>

        <TabsContent value="cooking" className="mt-6" hidden={currentTabIndex !== 2}>
          <div className="space-y-6">
            <CookingPreferencesSection form={form} />
            <CuisineSection form={form} />
          </div>
        </TabsContent>

        <TabsContent value="medical" className="mt-6" hidden={currentTabIndex !== 3}>
          <div className="space-y-6">
            <HealthSection form={form} />
            <ActivitySection form={form} />
            <MedicalSection form={form} />
          </div>
        </TabsContent>

        <TabsContent value="shopping" className="mt-6" hidden={currentTabIndex !== 4}>
          <div className="space-y-6">
            <PlanningSection form={form} />
            <ShoppingPreferencesSection form={form} />
          </div>
        </TabsContent>

        <TabsContent value="religious" className="mt-6" hidden={currentTabIndex !== 5}>
          <ReligiousRestrictionsSection form={form} />
        </TabsContent>
      </div>
    </>
  );
};