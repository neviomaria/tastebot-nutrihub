import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
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

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
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

        // Verify session is still valid
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!mounted) return;
        
        const isValid = !!session;
        console.log("Session valid:", isValid);
        setIsAuthenticated(isValid);
        
        if (session?.user) {
          console.log("Session initialized with user:", session.user.email);
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (!mounted) return;
        setIsAuthenticated(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        queryClient.clear();
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
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
            <ProtectedRoutes>
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
            </ProtectedRoutes>
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