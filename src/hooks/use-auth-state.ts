import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!mounted) return;

        // If no session exists, user is not authenticated
        if (!session) {
          console.log("No active session found");
          setIsAuthenticated(false);
          return;
        }

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User verification error:", userError);
          setIsAuthenticated(false);
          // Clear the invalid session
          await supabase.auth.signOut();
          return;
        }

        if (!user) {
          console.log("No user found in session");
          setIsAuthenticated(false);
          return;
        }

        console.log("Session initialized with user:", user.email);
        setIsAuthenticated(true);

      } catch (error) {
        console.error("Auth initialization error:", error);
        if (!mounted) return;
        
        setIsAuthenticated(false);
        
        // Clear any potentially invalid session
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("Error during sign out:", signOutError);
        }
        
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in again.",
        });
        
        navigate('/auth');
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.removeItem('supabase.auth.token');
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
        navigate('/auth');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setIsAuthenticated(true);
        if (event === 'SIGNED_IN') {
          toast({
            title: "Signed in",
            description: "Welcome back!",
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  return { isAuthenticated };
};