import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  coupon_code: z.string().optional(),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Privacy Policy to continue",
  }),
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
      coupon_code: searchParams.get("coupon") || "",
      privacyAccepted: false,
    },
  });

  useEffect(() => {
    const couponFromUrl = searchParams.get("coupon");
    if (couponFromUrl) {
      form.setValue("coupon_code", couponFromUrl);
    }
  }, [searchParams, form]);

  const onSubmit = async (values: SignUpValues) => {
    if (!values.privacyAccepted) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must accept the Privacy Policy to continue",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Starting signup with values:", {
        email: values.email,
        couponCode: values.coupon_code,
      });

      if (!values.email) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Email is required",
        });
        return;
      }

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
          book_title: verifyData.book_title
        };
      }

      // Get the current window location origin
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback`;
      console.log('Redirect URL:', redirectTo);

      // Create user with metadata including coupon information
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            access_level: "freemium",
            coupon_code: values.coupon_code || null,
            book_id: bookData?.book_id || null,
            book_title: bookData?.book_title || null
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

      if (!authData.user) {
        toast({
          title: "Error",
          description: "No user data returned",
          variant: "destructive",
        });
        return;
      }

      if (bookData && authData.user) {
        // Insert into user_coupons table
        const { error: couponError } = await supabase
          .from('user_coupons')
          .insert({
            user_id: authData.user.id,
            coupon_code: values.coupon_code,
            book_id: bookData.book_id,
            book_title: bookData.book_title
          });

        if (couponError) {
          console.error("Error saving coupon:", couponError);
          // Even if there's an error saving the coupon, we continue since the user is created
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Account created but there was an error saving your coupon. Please contact support.",
          });
        }

        // Update the profile with coupon information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            coupon_code: values.coupon_code,
            book_id: bookData.book_id,
            book_title: bookData.book_title
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
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
          required
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
          required
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="privacy"
          {...form.register("privacyAccepted")}
          onCheckedChange={(checked) => {
            form.setValue("privacyAccepted", checked === true);
          }}
        />
        <Label htmlFor="privacy" className="text-sm text-gray-600">
          I have read and accept the{" "}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover underline"
          >
            Privacy Policy
          </a>
        </Label>
      </div>
      {form.formState.errors.privacyAccepted && (
        <p className="text-sm text-red-500">
          {form.formState.errors.privacyAccepted.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
};