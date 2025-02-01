import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SelectFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  options: readonly string[];
  multiple?: boolean;
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export const SelectField = ({ 
  form, 
  name, 
  label, 
  options, 
  multiple = false, 
  className,
  searchValue = "",
  onSearchChange
}: SelectFieldProps) => {
  const values = form.watch(name) || [];

  const handleValueChange = (value: string) => {
    if (multiple) {
      const currentValues = form.getValues(name) || [];
      if (currentValues.includes(value)) {
        form.setValue(name, currentValues.filter((v: string) => v !== value));
      } else {
        form.setValue(name, [...currentValues, value]);
      }
    } else {
      form.setValue(name, value);
    }
  };

  const removeValue = (valueToRemove: string) => {
    const currentValues = form.getValues(name) || [];
    form.setValue(
      name,
      currentValues.filter((value: string) => value !== valueToRemove)
    );
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <div className="space-y-2">
            <Select
              onValueChange={handleValueChange}
              value={multiple ? undefined : field.value}
            >
              <SelectTrigger className="bg-white">
                <SelectValue 
                  placeholder={label ? `Select ${label.toLowerCase()}` : "Select option"} 
                />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {onSearchChange && (
                  <div className="p-2 pb-0">
                    <Input
                      placeholder="Search..."
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="h-8"
                    />
                  </div>
                )}
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {multiple && values.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {values.map((value: string) => (
                  <Badge key={value} variant="secondary">
                    {value}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                      onClick={() => removeValue(value)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};