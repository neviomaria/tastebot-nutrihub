import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  const handleAuthError = () => {
    try {
      navigate('/auth', { replace: true, state: { from: location.pathname } });
    } catch (error) {
      console.error('Error handling auth error:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        // Verify session is still valid with a separate call
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("User verification error:", userError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        // Check if user has completed their profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, country')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile check error:", profileError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        // If profile is incomplete and user is not already on the complete-profile page
        if ((!profile?.first_name || !profile?.last_name || !profile?.country) && 
            location.pathname !== '/complete-profile') {
          if (mounted) {
            toast({
              title: "Profile Incomplete",
              description: "Please complete your profile information.",
              duration: 5000,
            });
            navigate('/complete-profile', { replace: true });
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
          handleAuthError();
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        handleAuthError();
      } else if (!session) {
        handleAuthError();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location, toast]);

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
};