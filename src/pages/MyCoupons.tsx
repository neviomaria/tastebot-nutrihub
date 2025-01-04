import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddCouponForm, couponSchema, type CouponFormValues } from "@/components/coupons/AddCouponForm";
import { CouponList } from "@/components/coupons/CouponList";
import { useQuery } from "@tanstack/react-query";

interface BookAccess {
  book_id: string;
  book_title: string;
  coupon_code: string;
}

const MyCoupons = () => {
  const { toast } = useToast();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      coupon_code: "",
    },
  });

  const { data: bookAccess = [], isLoading, refetch } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("coupon_code, book_id, book_title")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile?.coupon_code && profile?.book_id && profile?.book_title) {
        return [{
          book_id: profile.book_id,
          book_title: profile.book_title,
          coupon_code: profile.coupon_code,
        }] as BookAccess[];
      }
      
      return [] as BookAccess[];
    },
  });

  const onSubmit = async (values: CouponFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase.functions.invoke('verify-coupon', {
        body: { coupon_code: values.coupon_code }
      });

      if (error) throw error;

      if (data.success) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            coupon_code: values.coupon_code,
            book_id: data.book_id,
            book_title: data.book_title,
            access_level: data.access_level
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

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

      const { error } = await supabase
        .from('profiles')
        .update({
          coupon_code: null,
          book_id: null,
          book_title: null,
          access_level: null
        })
        .eq('id', user.id);

      if (error) throw error;

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
          <CouponList bookAccess={bookAccess} onRemoveCoupon={removeCoupon} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCoupons;