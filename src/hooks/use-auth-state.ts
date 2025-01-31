import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: error.message,
        });
      }

      setIsAuthenticated(false);
      navigate('/auth');
    } catch (error) {
      console.error("Error during sign out:", error);
      setIsAuthenticated(false);
      navigate('/auth');
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying auth initialization (${retryCount}/${maxRetries})...`);
              setTimeout(initializeAuth, retryDelay);
              return;
            }
            setIsAuthenticated(false);
            handleSignOut();
          }
          return;
        }

        if (!mounted) return;

        if (!session) {
          console.log("No active session found");
          setIsAuthenticated(false);
          return;
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User verification error:", userError);
          if (mounted) {
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying user verification (${retryCount}/${maxRetries})...`);
              setTimeout(initializeAuth, retryDelay);
              return;
            }
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
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying after error (${retryCount}/${maxRetries})...`);
          setTimeout(initializeAuth, retryDelay);
          return;
        }
        
        setIsAuthenticated(false);
        handleSignOut();
      }
    };

    // Initial auth check
    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
        navigate('/auth');
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        // Only show welcome toast on actual sign in
        toast({
          title: "Signed in",
          description: "Welcome back!",
        });
      } else if (event === 'TOKEN_REFRESHED') {
        // Just update the auth state without showing a toast
        setIsAuthenticated(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  return { isAuthenticated, handleSignOut };
};