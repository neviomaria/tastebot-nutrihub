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
import { ProfileHeader } from "./ProfileHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { SelectField } from "@/components/form/SelectField";
import { countries } from "@/schemas/countries";
import { Flag } from "lucide-react";

interface BasicInfoFieldsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      form.setValue('avatar_url', publicUrl);
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload profile picture",
      });
    } finally {
      setUploading(false);
    }
  };

  const checkUsername = async (username: string) => {
    try {
      setCheckingUsername(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .neq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking username:', error);
        return;
      }

      if (data) {
        form.setError('username', {
          type: 'manual',
          message: 'This username is already taken'
        });
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

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

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="johndoe" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    if (e.target.value.length >= 3) {
                      checkUsername(e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
              {checkingUsername && (
                <p className="text-sm text-muted-foreground">Checking username availability...</p>
              )}
            </FormItem>
          )}
        />

        <div className="relative">
          <SelectField
            form={form}
            name="country"
            label="Country"
            options={countries}
          />
          <Flag className="absolute right-8 top-[2.25rem] h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <FormField
        control={form.control}
        name="avatar_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile Picture</FormLabel>
            <FormControl>
              <div className="flex items-center gap-4">
                <ProfileHeader
                  avatarUrl={field.value}
                  firstName={form.watch("first_name")}
                />
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <input type="hidden" {...field} />
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};