import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const couponSchema = z.object({
  coupon_code: z.string().optional(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFieldProps {
  form: UseFormReturn<CouponFormValues>;
}

export const CouponField = ({ form }: CouponFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="coupon_code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Coupon Code</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter your book coupon code"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};