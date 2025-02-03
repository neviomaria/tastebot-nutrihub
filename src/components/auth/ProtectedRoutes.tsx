import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const ProtectedRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  const handleAuthError = () => {
    try {
      // Clear any existing session data
      supabase.auth.signOut();
      navigate('/auth', { replace: true, state: { from: location.pathname } });
    } catch (error) {
      console.error('Error handling auth error:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("Checking auth state...");
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
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

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User verification error:", userError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        if (!user) {
          console.log("No user found in session");
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        // Check if user has completed their profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile check error:", profileError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        // If first name or last name is missing and user is not already on the complete-profile page
        const isProfileIncomplete = !profile?.first_name?.trim() || !profile?.last_name?.trim();
        const isOnCompleteProfilePage = location.pathname === '/complete-profile';
        
        if (isProfileIncomplete && !isOnCompleteProfilePage) {
          console.log("Name fields incomplete, redirecting to complete-profile");
          if (mounted) {
            toast({
              title: "Complete Your Profile",
              description: "Please provide your first and last name to continue.",
              duration: 5000,
            });
            navigate('/complete-profile', { replace: true });
          }
          return;
        }

        console.log("Auth check completed successfully");

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
      console.log("Auth state changed:", event, "Session:", session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        handleAuthError();
      } else if (event === 'SIGNED_IN') {
        checkAuth();
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

  return <Outlet />;
};