import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface CheckboxFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  options: readonly (string | Option)[];
}

export const CheckboxField = ({ form, name, label, options }: CheckboxFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="grid grid-cols-1 gap-4 mt-2">
            {options.map((option) => (
              <FormField
                key={typeof option === 'string' ? option : option.value}
                control={form.control}
                name={name}
                render={({ field }) => {
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const optionLabel = typeof option === 'string' ? option : option.label;
                  const isNoneOption = optionValue === "None";
                  const currentValue = field.value || [];
                  
                  return (
                    <FormItem
                      key={optionValue}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(optionValue)}
                          onCheckedChange={(checked) => {
                            let updated;
                            if (isNoneOption && checked) {
                              updated = ["None"];
                            } else if (!isNoneOption && checked) {
                              updated = [...currentValue.filter(val => val !== "None"), optionValue];
                            } else {
                              updated = currentValue.filter((value: string) => value !== optionValue);
                            }
                            field.onChange(updated);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {optionLabel}
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