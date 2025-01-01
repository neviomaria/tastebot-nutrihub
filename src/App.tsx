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
import { AppSidebar } from "@/components/AppSidebar";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        // Clear query cache when user logs out
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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