import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/use-auth-state";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthState();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Don't render anything while checking auth state
  if (isAuthenticated === null) {
    return null;
  }

  // Don't render auth content if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};