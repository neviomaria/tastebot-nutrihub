import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ProtectedRoutes } from "@/components/auth/ProtectedRoutes";
import { useAuthState } from "@/hooks/use-auth-state";
import { useEffect } from "react";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AuthenticatedApp() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfileCompletion = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (!profile?.first_name || !profile?.last_name) {
        navigate('/complete-profile');
      }
    };

    checkProfileCompletion();
  }, [navigate]);

  return (
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
  );
}

function App() {
  const { isAuthenticated } = useAuthState();

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
              <AuthenticatedApp />
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