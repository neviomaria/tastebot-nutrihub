import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";

interface EmailFieldProps {
  form: UseFormReturn<ProfileFormValues>;
  userEmail: string;
}

export const EmailField = ({ form, userEmail }: EmailFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="email"
      render={() => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            Email
            <span className="text-xs text-muted-foreground">(non-editable)</span>
          </FormLabel>
          <FormControl>
            <Input 
              type="email"
              placeholder="john.doe@example.com" 
              value={userEmail || ""} 
              readOnly
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};