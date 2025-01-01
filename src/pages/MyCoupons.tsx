import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CouponField } from "@/components/form/CouponField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Trash2 } from "lucide-react";

const couponSchema = z.object({
  coupon_code: z.string().min(1, "Coupon code is required"),
});

type CouponFormValues = z.infer<typeof couponSchema>;

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

  useEffect(() => {
    fetchUserCoupons();
  }, []);

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
        .select("coupon_code, book_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile.coupon_code && profile.book_id) {
        setBookAccess([{
          book_id: profile.book_id,
          book_title: "Your Book", // You might want to fetch the actual title from WordPress
          coupon_code: profile.coupon_code,
        }]);
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
            book_id: data.book_id
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
          book_id: null
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CouponField form={form} />
              <Button type="submit">Add Coupon</Button>
            </form>
          </Form>

          <div className="space-y-4">
            <h3 className="font-medium">Active Coupons</h3>
            {bookAccess.length === 0 ? (
              <p className="text-muted-foreground">No active coupons</p>
            ) : (
              <div className="space-y-4">
                {bookAccess.map((access) => (
                  <div
                    key={access.book_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{access.book_title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Coupon: {access.coupon_code}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCoupon(access.coupon_code)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCoupons;