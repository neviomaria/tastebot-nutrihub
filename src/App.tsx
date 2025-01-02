import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CompleteProfile from "@/pages/CompleteProfile";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import MyCoupons from "@/pages/MyCoupons";
import MyBooks from "@/pages/MyBooks";
import BookDetail from "@/pages/BookDetail";
import BookRecipes from "@/pages/BookRecipes";
import RecipeDetail from "@/pages/RecipeDetail";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/components/ui/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        // Get the initial session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        console.log("Session data:", sessionData);

        if (!mounted) return;

        // If we have a session, verify it's still valid
        if (sessionData.session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error("User error:", userError);
            throw userError;
          }

          if (!mounted) return;
          
          setIsAuthenticated(!!user);
          console.log("Session initialized with user:", user?.email);
        } else {
          if (!mounted) return;
          setIsAuthenticated(false);
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (!mounted) return;
        setIsAuthenticated(false);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please try logging in again.",
        });
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        queryClient.clear();
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else if (event === 'SIGNED_IN') {
        if (session?.user) {
          setIsAuthenticated(true);
          toast({
            title: "Signed in",
            description: "Welcome back!",
          });
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
        setIsAuthenticated(true);
      } else if (event === 'USER_UPDATED') {
        setIsAuthenticated(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  // Show nothing while checking auth state
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {isAuthenticated ? (
            <AppSidebar>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Navigate to="/" replace />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-coupons" element={<MyCoupons />} />
                <Route path="/my-books" element={<MyBooks />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/book/:id/recipes" element={<BookRecipes />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
              </Routes>
            </AppSidebar>
          ) : (
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;