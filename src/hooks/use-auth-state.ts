import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // First clear any stored session data
      localStorage.removeItem('supabase.auth.token');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: error.message,
        });
      }

      // Always set authenticated to false and redirect, even if there was an error
      setIsAuthenticated(false);
      navigate('/auth');
    } catch (error) {
      console.error("Error during sign out:", error);
      // Force clear auth state even on error
      setIsAuthenticated(false);
      navigate('/auth');
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setIsAuthenticated(false);
            handleSignOut();
          }
          return;
        }

        if (!mounted) return;

        // If no session exists, user is not authenticated
        if (!session) {
          console.log("No active session found");
          setIsAuthenticated(false);
          return;
        }

        // Verify the session is still valid with a separate call
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User verification error:", userError);
          if (mounted) {
            setIsAuthenticated(false);
            handleSignOut();
          }
          return;
        }

        if (!user) {
          console.log("No user found in session");
          if (mounted) {
            setIsAuthenticated(false);
            handleSignOut();
          }
          return;
        }

        console.log("Session initialized with user:", user.email);
        if (mounted) {
          setIsAuthenticated(true);
        }

      } catch (error) {
        console.error("Auth initialization error:", error);
        if (!mounted) return;
        
        setIsAuthenticated(false);
        handleSignOut();
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(false);
        localStorage.removeItem('supabase.auth.token');
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
          navigate('/auth');
        }
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        toast({
          title: "Signed in",
          description: "Welcome back!",
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  return { isAuthenticated, handleSignOut };
};