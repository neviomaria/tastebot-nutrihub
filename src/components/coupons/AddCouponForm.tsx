import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CouponField } from "@/components/form/CouponField";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const couponSchema = z.object({
  coupon_code: z.string().min(1, "Coupon code is required"),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface AddCouponFormProps {
  form: UseFormReturn<CouponFormValues>;
  onSubmit: (values: CouponFormValues) => Promise<void>;
}

export const AddCouponForm = ({ form, onSubmit }: AddCouponFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CouponField form={form} />
        <Button type="submit">Add Coupon</Button>
      </form>
    </Form>
  );
};

export { couponSchema };
export type { CouponFormValues };