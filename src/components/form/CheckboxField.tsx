import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface CheckboxFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  options: readonly string[];
}

export const CheckboxField = ({ form, name, label, options }: CheckboxFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {options.map((option) => (
              <FormField
                key={option}
                control={form.control}
                name={name}
                render={({ field }) => {
                  return (
                    <FormItem
                      key={option}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(option)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            const updated = checked
                              ? [...current, option]
                              : current.filter((value: string) => value !== option);
                            field.onChange(updated);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {option}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};