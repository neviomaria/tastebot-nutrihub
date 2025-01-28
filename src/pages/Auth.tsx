import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ViewType } from "@supabase/auth-ui-shared";
import { SignUpCouponForm } from "@/components/auth/SignUpCouponForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AuthPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Error signing in:", error.message);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Pybher
        </h2>
        <p className="text-gray-600">
          {view === "sign_in" ? "Sign in to your account" : "Create your account"}
        </p>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <Button
          onClick={() => handleViewChange("sign_in")}
          variant={view === "sign_in" ? "default" : "outline"}
          className="w-24"
        >
          Sign In
        </Button>
        <Button
          onClick={() => handleViewChange("sign_up")}
          variant={view === "sign_up" ? "default" : "outline"}
          className="w-24"
        >
          Sign Up
        </Button>
      </div>

      {view === "sign_up" ? (
        <div className="mb-6">
          <SignUpCouponForm />
        </div>
      ) : (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          <div className="text-center space-y-2 mt-4">
            <a href="#" className="text-sm text-primary hover:underline block">
              Forgot your password?
            </a>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => handleViewChange("sign_up")}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default AuthPage;