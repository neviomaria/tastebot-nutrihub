import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, healthGoals } from "@/schemas/profile";

interface HealthSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const HealthSection = ({ form }: HealthSectionProps) => {
  return (
    <FormField
      control={form.control}
      name="health_goal"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Health Goals</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-2 gap-4"
            >
              {healthGoals.map((goal) => (
                <FormItem
                  key={goal}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={goal} />
                  </FormControl>
                  <FormLabel className="font-normal">{goal}</FormLabel>
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