import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface CouponFieldProps {
  form: UseFormReturn<any>;
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