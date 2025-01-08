import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  coupon_code: z.string().optional(),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export const SignUpCouponForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      coupon_code: searchParams.get("coupon") || "", // Auto-populate from URL
    },
  });

  // Update coupon code when URL parameter changes
  useEffect(() => {
    const couponFromUrl = searchParams.get("coupon");
    if (couponFromUrl) {
      form.setValue("coupon_code", couponFromUrl);
    }
  }, [searchParams, form]);

  const onSubmit = async (values: SignUpValues) => {
    try {
      setIsLoading(true);
      console.log("Starting signup with values:", {
        email: values.email,
        couponCode: values.coupon_code 
      });

      // If a coupon code was provided, verify it first
      let bookData = null;
      if (values.coupon_code) {
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-coupon', {
          body: { coupon_code: values.coupon_code }
        });

        if (verifyError) {
          console.error('Coupon verification error:', verifyError);
          toast({
            title: "Error",
            description: "Invalid coupon code. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (!verifyData?.success) {
          console.error('Invalid coupon:', values.coupon_code);
          toast({
            title: "Error",
            description: "Invalid coupon code. Please try again.",
            variant: "destructive",
          });
          return;
        }

        bookData = {
          book_id: verifyData.book_id,
          book_title: verifyData.book_title,
          access_level: "freemium" // Always set to freemium regardless of coupon
        };
      }

      // Set the redirect URL based on the environment
      let redirectTo;
      if (window.location.hostname === 'pybher.com') {
        redirectTo = 'https://pybher.com/auth/callback';
      } else if (window.location.hostname === '192.168.1.182') {
        redirectTo = 'http://192.168.1.182:8080/auth/callback';
      } else {
        // Fallback for other environments (like localhost)
        redirectTo = `${window.location.origin}/auth/callback`;
      }
      
      console.log('Redirect URL:', redirectTo);

      // Sign up the user with metadata including the coupon and book information
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            coupon_code: values.coupon_code || null,
            book_id: bookData?.book_id || null,
            book_title: bookData?.book_title || null,
            access_level: "freemium", // Always set to freemium for new users
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (authError) {
        console.error("Signup error:", authError);
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Signup successful:", authData);
      toast({
        title: "Success",
        description: "Please check your email to confirm your account.",
      });

    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          {...form.register("email")}
          className="w-full"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Password"
          {...form.register("password")}
          className="w-full"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="text"
          placeholder="Coupon Code (Optional)"
          {...form.register("coupon_code")}
          className="w-full"
        />
        {form.formState.errors.coupon_code && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.coupon_code.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
};