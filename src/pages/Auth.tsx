import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ViewType } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome to Pybher</h2>
        <p className="text-gray-600 mt-2">
          {view === "sign_in" ? "Sign in to your account" : "Create your account"}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setView("sign_in")}
          variant={view === "sign_in" ? "default" : "outline"}
          className="flex-1"
        >
          Sign In
        </Button>
        <Button
          onClick={() => setView("sign_up")}
          variant={view === "sign_up" ? "default" : "outline"}
          className="flex-1"
        >
          Sign Up
        </Button>
      </div>

      {view === "sign_up" ? (
        <SignUpCouponForm />
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
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate("/auth/reset-password")}
              className="text-sm text-primary hover:underline block"
            >
              Forgot your password?
            </button>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setView("sign_up")}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default AuthPage;