import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, activityLevels } from "@/schemas/profile";

interface ActivitySectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const ActivitySection = ({ form }: ActivitySectionProps) => {
  return (
    <FormField
      control={form.control}
      name="activity_level"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Activity Level</FormLabel>
          <FormDescription>
            Select your typical weekly activity level
          </FormDescription>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid gap-4"
            >
              {activityLevels.map((level) => (
                <FormItem
                  key={level}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={level} />
                  </FormControl>
                  <FormLabel className="font-normal">{level}</FormLabel>
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