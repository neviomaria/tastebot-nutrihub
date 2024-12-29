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
import { ProfileFormValues, cuisineTypes } from "@/schemas/profile";

interface CuisineSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const CuisineSection = ({ form }: CuisineSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="favorite_cuisines"
        render={() => (
          <FormItem>
            <FormLabel>Favorite Cuisines</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {cuisineTypes.map((cuisine) => (
                <FormField
                  key={cuisine}
                  control={form.control}
                  name="favorite_cuisines"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(cuisine)}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            return checked
                              ? field.onChange([...value, cuisine])
                              : field.onChange(value.filter((i) => i !== cuisine));
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{cuisine}</FormLabel>
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
        name="other_cuisines"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Other Cuisines</FormLabel>
            <FormControl>
              <Input placeholder="Enter any other favorite cuisines" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};