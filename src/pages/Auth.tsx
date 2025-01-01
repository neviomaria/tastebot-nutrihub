import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpCouponForm } from "@/components/auth/SignUpCouponForm";
import { ViewType } from "@supabase/auth-ui-shared";

const AuthPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>("sign_in");

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome
        </h2>
        <p className="text-gray-600">
          {view === "sign_in" ? "Sign in to your account" : "Create your account"}
        </p>
      </div>
      
      <Auth
        supabaseClient={supabase}
        view={view}
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
            message: "text-sm text-red-500",
            anchor: "text-primary hover:text-primary-hover",
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
      />
      
      {view === "sign_up" && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Enter your book coupon code</h3>
          <SignUpCouponForm />
        </div>
      )}
    </AuthLayout>
  );
};

export default AuthPage;