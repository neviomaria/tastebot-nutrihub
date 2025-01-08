import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CouponFormData {
  couponCode: string;
}

export default function SignUpCouponForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CouponFormData>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (data: CouponFormData) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to add coupons",
        });
        return;
      }

      // Verify the coupon
      const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-coupon', {
        body: { couponCode: data.couponCode },
      });

      if (verificationError || !verificationData?.isValid) {
        toast({
          variant: "destructive",
          title: "Invalid Coupon",
          description: "The coupon code you entered is not valid",
        });
        return;
      }

      // Save the coupon to the user_coupons table
      const { error: insertError } = await supabase
        .from('user_coupons')
        .insert({
          user_id: user.id,
          coupon_code: data.couponCode,
          book_id: verificationData.bookId,
          book_title: verificationData.bookTitle,
        });

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          toast({
            variant: "destructive",
            title: "Duplicate Coupon",
            description: "You have already used this coupon code",
          });
          return;
        }
        throw insertError;
      }

      toast({
        title: "Success",
        description: "Coupon added successfully",
      });
      
      reset();
      navigate('/my-books');
    } catch (error) {
      console.error('Error adding coupon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add coupon. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('couponCode', { required: 'Coupon code is required' })}
          placeholder="Enter your coupon code"
          className="w-full"
        />
        {errors.couponCode && (
          <p className="text-red-500 text-sm mt-1">{errors.couponCode.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full">
        Add Coupon
      </Button>
    </form>
  );
}