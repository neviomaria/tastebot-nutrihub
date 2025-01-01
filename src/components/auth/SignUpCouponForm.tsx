import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { CouponField } from "@/components/form/CouponField";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const couponSchema = z.object({
  coupon_code: z.string().optional(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export const SignUpCouponForm = () => {
  const { toast } = useToast();
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      coupon_code: "",
    },
  });

  const onSubmit = async (values: CouponFormValues) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-coupon', {
        body: { coupon_code: values.coupon_code }
      });

      if (error) {
        console.error('Verification error:', error);
        toast({
          title: "Error",
          description: "Failed to verify coupon code. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.valid) {
        toast({
          title: "Success",
          description: "Coupon code verified successfully!",
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: "The provided coupon code is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CouponField form={form} />
      </form>
    </Form>
  );
};