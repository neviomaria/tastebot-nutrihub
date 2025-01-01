import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddCouponForm, couponSchema, type CouponFormValues } from "@/components/coupons/AddCouponForm";
import { CouponList } from "@/components/coupons/CouponList";

interface BookAccess {
  book_id: string;
  book_title: string;
  coupon_code: string;
}

const MyCoupons = () => {
  const [bookAccess, setBookAccess] = useState<BookAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      coupon_code: "",
    },
  });

  const fetchUserCoupons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to view your coupons",
        });
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("coupon_code, book_id, book_title")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile?.coupon_code && profile?.book_id && profile?.book_title) {
        setBookAccess([{
          book_id: profile.book_id,
          book_title: profile.book_title,
          coupon_code: profile.coupon_code,
        }]);
      } else {
        setBookAccess([]);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your coupons",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCoupons();
  }, []);

  const onSubmit = async (values: CouponFormValues) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-coupon', {
        body: { coupon_code: values.coupon_code }
      });

      if (error) throw error;

      if (data.success) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("User not found");

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            coupon_code: values.coupon_code,
            book_id: data.book_id,
            book_title: data.book_title
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Coupon code verified and applied successfully",
        });

        form.reset();
        fetchUserCoupons();
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
          book_title: null
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coupon removed successfully",
      });

      fetchUserCoupons();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove coupon",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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