import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const ProtectedRoutes = () => { 
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
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

  const checkProfileCompletion = async (userId: string) => {
    console.log("[ProtectedRoutes] Checking profile completion for user:", userId);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("[ProtectedRoutes] Profile check error:", error);
      return false;
    }

    const isComplete = Boolean(profile?.first_name?.trim() && profile?.last_name?.trim());
    console.log("[ProtectedRoutes] Profile data:", profile);
    console.log("[ProtectedRoutes] Is profile complete?", isComplete);
    console.log("[ProtectedRoutes] First name:", profile?.first_name);
    console.log("[ProtectedRoutes] Last name:", profile?.last_name);
    
    return isComplete;
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("[ProtectedRoutes] Starting auth check...");
        console.log("[ProtectedRoutes] Current path:", location.pathname);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[ProtectedRoutes] Session check error:", sessionError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        if (!session) {
          console.log("[ProtectedRoutes] No active session found");
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("[ProtectedRoutes] User verification error:", userError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        if (!user) {
          console.log("[ProtectedRoutes] No user found in session");
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        // Check if profile is complete
        const isComplete = await checkProfileCompletion(user.id);
        console.log("[ProtectedRoutes] Profile completion check result:", isComplete);
        
        if (mounted) {
          setIsProfileComplete(isComplete);
          
          // If profile is incomplete and not on complete-profile page, redirect
          if (!isComplete && location.pathname !== '/complete-profile') {
            console.log("[ProtectedRoutes] Profile incomplete, redirecting to complete-profile");
            toast({
              title: "Complete Your Profile",
              description: "Please provide your first and last name to continue.",
              duration: 5000,
            });
            navigate('/complete-profile', { replace: true });
          } else {
            console.log("[ProtectedRoutes] Profile is complete or already on complete-profile page");
          }
          
          setIsChecking(false);
        }

      } catch (error) {
        console.error("[ProtectedRoutes] Auth check error:", error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please try logging in again.",
          });
          handleAuthError();
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[ProtectedRoutes] Auth state changed:", event, "Session:", session?.user?.email);
      
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
  }, [navigate, location.pathname, toast]);

  // Show nothing while checking auth state
  if (isChecking) {
    console.log("[ProtectedRoutes] Still checking auth state...");
    return null;
  }

  // Only render the route if we're on complete-profile page OR if profile is complete
  if (!isProfileComplete && location.pathname !== '/complete-profile') {
    console.log("[ProtectedRoutes] Blocking navigation - profile incomplete");
    console.log("[ProtectedRoutes] Current path:", location.pathname);
    console.log("[ProtectedRoutes] Profile complete status:", isProfileComplete);
    
    navigate('/complete-profile', { replace: true });
    return null;
  }

  console.log("[ProtectedRoutes] Rendering protected route:", location.pathname);
  return <Outlet />;
};
