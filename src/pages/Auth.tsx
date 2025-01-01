import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CouponField } from "@/components/form/CouponField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const couponSchema = z.object({
  coupon_code: z.string().optional(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

const AuthPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_in");
  const { toast } = useToast();
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      coupon_code: "",
    },
  });

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const onSubmit = async (values: CouponFormValues) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-coupon', {
        body: { coupon_code: values.coupon_code }
      });

      if (error) {
        console.error('Verification error:', error);
        toast({
          title: "Error",
          description: "Failed to verify coupon code. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.valid) {
        toast({
          title: "Success",
          description: "Coupon code verified successfully!",
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: "The provided coupon code is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-auth-gradient-from to-auth-gradient-to text-auth-text p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-6">Meal Planner</h1>
          <p className="text-xl opacity-90 leading-relaxed">
            Your personal meal planning assistant, included with your book purchase.
            Enter your book coupon code to access exclusive content.
          </p>
        </div>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Personalized Plans</h3>
              <p className="opacity-75">
                Get customized meal plans based on your preferences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Save Time</h3>
              <p className="opacity-75">
                Plan your meals for the week in minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 p-8 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome
            </h2>
            <p className="text-gray-600">
              {view === "sign_in" ? "Sign in to your account" : "Create your account"}
            </p>
          </div>
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#9747FF",
                    brandAccent: "#8A35FF",
                    inputBackground: "#F4F7FE",
                    inputText: "#1B2559",
                    inputBorder: "#E6EDF9",
                  },
                  borderWidths: {
                    buttonBorderWidth: "0px",
                    inputBorderWidth: "1px",
                  },
                  radii: {
                    borderRadiusButton: "8px",
                    buttonBorderRadius: "8px",
                    inputBorderRadius: "8px",
                  },
                },
              },
              className: {
                container: "w-full",
                button: "w-full bg-primary hover:bg-primary-hover text-white",
                input: "w-full bg-auth-input text-secondary-foreground",
                label: "text-gray-700",
              },
            }}
            localization={{
              variables: {
                sign_up: {
                  email_label: "Email",
                  password_label: "Password",
                  button_label: "Sign Up",
                  link_text: "Don't have an account? Sign up",
                },
                sign_in: {
                  email_label: "Email",
                  password_label: "Password",
                  button_label: "Sign In",
                  link_text: "Already have an account? Sign in",
                },
              },
            }}
            providers={[]}
            view={view}
            onViewChange={(newView) => setView(newView)}
          />
          {view === "sign_up" && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <CouponField form={form} />
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;