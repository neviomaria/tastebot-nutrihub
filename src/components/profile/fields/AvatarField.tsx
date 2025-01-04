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
import { ProfileHeader } from "../ProfileHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface AvatarFieldProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const AvatarField = ({ form }: AvatarFieldProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to upload a profile picture",
        });
        return;
      }

      // Delete previous avatar if it exists
      const currentAvatarUrl = form.getValues("avatar_url");
      if (currentAvatarUrl) {
        const filePath = currentAvatarUrl.split("/").pop();
        if (filePath) {
          await supabase.storage
            .from("profile-pictures")
            .remove([filePath]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

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
      // Set avatar_url to null on error
      form.setValue('avatar_url', null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="avatar_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Profile Picture (Optional)</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              <ProfileHeader
                avatarUrl={field.value || undefined}
                firstName={form.watch("first_name")}
                lastName={form.watch("last_name")}
              />
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <input type="hidden" {...field} value={field.value || ''} />
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};