import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) {
            navigate('/auth', { replace: true, state: { from: location.pathname } });
          }
          return;
        }

        if (!session) {
          if (mounted) {
            navigate('/auth', { replace: true, state: { from: location.pathname } });
          }
          return;
        }

        // Verify session is still valid with a separate call
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("User verification error:", userError);
          if (mounted) {
            navigate('/auth', { replace: true, state: { from: location.pathname } });
          }
          return;
        }

      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please try logging in again.",
          });
          navigate('/auth', { replace: true, state: { from: location.pathname } });
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [navigate, location, toast]);

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
};