import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddCouponForm, couponSchema, type CouponFormValues } from "@/components/coupons/AddCouponForm";
import { CouponList } from "@/components/coupons/CouponList";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface BookAccess {
  book_id: string;
  book_title: string;
  coupon_code: string;
}

const MyCoupons = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      coupon_code: "",
    },
  });

  // Fetch both profile coupon and user_coupons
  const { data: allBookAccess = [], isLoading, refetch } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch profile coupon
      const { data: profile } = await supabase
        .from("profiles")
        .select("book_id, book_title, coupon_code")
        .eq("id", user.id)
        .single();

      // Fetch additional coupons
      const { data: userCoupons } = await supabase
        .from("user_coupons")
        .select("book_id, book_title, coupon_code")
        .eq("user_id", user.id);

      // Combine coupons, ensuring profile coupon is included if it exists
      let allCoupons: BookAccess[] = [];
      if (profile?.coupon_code) {
        allCoupons.push({
          book_id: profile.book_id || '',
          book_title: profile.book_title || '',
          coupon_code: profile.coupon_code
        });
      }
      if (userCoupons) {
        allCoupons = [...allCoupons, ...userCoupons];
      }

      return allCoupons;
    },
  });

  const onSubmit = async (values: CouponFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Check if coupon already exists for this user (in both tables)
      const { data: existingProfileCoupon } = await supabase
        .from('profiles')
        .select('coupon_code')
        .eq('id', user.id)
        .eq('coupon_code', values.coupon_code)
        .single();

      const { data: existingUserCoupon } = await supabase
        .from('user_coupons')
        .select('coupon_code')
        .eq('user_id', user.id)
        .eq('coupon_code', values.coupon_code)
        .single();

      if (existingProfileCoupon || existingUserCoupon) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You have already added this coupon code",
        });
        return;
      }

      // Verify coupon with WordPress
      const { data, error } = await supabase.functions.invoke('verify-coupon', {
        body: { coupon_code: values.coupon_code }
      });

      if (error) throw error;

      if (data.success) {
        // Insert new coupon
        const { error: insertError } = await supabase
          .from('user_coupons')
          .insert({
            user_id: user.id,
            coupon_code: values.coupon_code,
            book_id: data.book_id,
            book_title: data.book_title
          });

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: "Coupon code verified and applied successfully",
        });

        form.reset();
        refetch();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to verify coupon code",
      });
    }
  };

  const removeCoupon = async (couponCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Check if this is the profile coupon
      const { data: profile } = await supabase
        .from('profiles')
        .select('coupon_code')
        .eq('id', user.id)
        .single();

      if (profile?.coupon_code === couponCode) {
        // Update profile to remove coupon
        const { error } = await supabase
          .from('profiles')
          .update({
            coupon_code: null,
            book_id: null,
            book_title: null
          })
          .eq('id', user.id);

        if (error) throw error;
      } else {
        // Remove from user_coupons
        const { error } = await supabase
          .from('user_coupons')
          .delete()
          .eq('user_id', user.id)
          .eq('coupon_code', couponCode);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Coupon removed successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove coupon",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Coupons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AddCouponForm form={form} onSubmit={onSubmit} />
          <CouponList bookAccess={allBookAccess} onRemoveCoupon={removeCoupon} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCoupons;