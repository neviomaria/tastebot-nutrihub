import { useProfileForm } from "@/hooks/use-profile-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProfileFormTabs } from "./ProfileFormTabs";
import { SubscriptionSection } from "./sections/SubscriptionSection";

export const ProfileForm = () => {
  const { form, onSubmit } = useProfileForm();

  return (
    <div className="space-y-8">
      <SubscriptionSection />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <ProfileFormTabs form={form} />
          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </div>
  );
};