import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { CouponField } from "@/components/form/CouponField";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const couponSchema = z.object({
  coupon_code: z.string().min(1, "Coupon code is required"),
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
      console.log('Verifying coupon:', values.coupon_code);
      
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

      console.log('Verification response:', data);

      if (data?.valid) {
        toast({
          title: "Success",
          description: "Coupon code verified successfully!",
        });
        // Clear the form after successful verification
        form.reset();
      } else {
        toast({
          title: "Invalid Coupon",
          description: data?.error || "The provided coupon code is not valid.",
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
        <Button type="submit" className="w-full">Verify Coupon</Button>
      </form>
    </Form>
  );
};