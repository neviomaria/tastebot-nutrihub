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
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { SelectField } from "@/components/form/SelectField";
import { countries } from "@/schemas/countries";
import { EmailField } from "./fields/EmailField";
import { AvatarField } from "./fields/AvatarField";

interface BasicInfoFieldsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  const [userEmail, setUserEmail] = useState<string>("");

  // Fetch user email on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error);
          return;
        }
        
        if (session?.user?.email) {
          const email = session.user.email;
          setUserEmail(email);
          form.setValue('email', email);
        }
      } catch (error) {
        console.error("Error in fetchUserEmail:", error);
      }
    };

    fetchUserEmail();
  }, [form]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <EmailField form={form} userEmail={userEmail} />

        <SelectField
          form={form}
          name="country"
          label="Country"
          options={countries}
        />
      </div>

      <AvatarField form={form} />
    </div>
  );
};