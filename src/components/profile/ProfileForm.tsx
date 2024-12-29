import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useProfileForm } from "@/hooks/use-profile-form";
import { ProfileFormTabs } from "./ProfileFormTabs";

export const ProfileForm = () => {
  const { form, onSubmit } = useProfileForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <Tabs defaultValue="profile" className="w-full">
          <ProfileFormTabs form={form} />
        </Tabs>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          Complete Profile
        </Button>
      </form>
    </Form>
  );
};