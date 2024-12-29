import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, planningPreferences } from "@/schemas/profile";

interface PlanningSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const PlanningSection = ({ form }: PlanningSectionProps) => {
  return (
    <FormField
      control={form.control}
      name="planning_preference"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Planning Preferences</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid gap-4"
            >
              {planningPreferences.map((pref) => (
                <FormItem
                  key={pref}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={pref} />
                  </FormControl>
                  <FormLabel className="font-normal">{pref}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};