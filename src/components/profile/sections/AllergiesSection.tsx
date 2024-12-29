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
import { ProfileFormValues, allergies } from "@/schemas/profile";

interface AllergiesSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const AllergiesSection = ({ form }: AllergiesSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="allergies"
        render={() => (
          <FormItem>
            <FormLabel>Allergies</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {allergies.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="allergies"
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
        name="other_allergies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Allergies</FormLabel>
            <FormControl>
              <Input placeholder="Enter any other allergies" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};