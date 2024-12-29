import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues, dietaryPreferences } from "@/schemas/profile";

interface DietarySectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const DietarySection = ({ form }: DietarySectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="dietary_preferences"
        render={() => (
          <FormItem>
            <FormLabel>Dietary Preferences</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {dietaryPreferences.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="dietary_preferences"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item)}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            return checked
                              ? field.onChange([...value, item])
                              : field.onChange(value.filter((i) => i !== item));
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{item}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="other_dietary_preferences"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Dietary Preferences</FormLabel>
            <FormControl>
              <Input placeholder="Enter any other dietary preferences" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};