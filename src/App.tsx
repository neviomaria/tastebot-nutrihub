import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoutes } from "@/components/auth/ProtectedRoutes";
import { useAuthState } from "@/hooks/use-auth-state";
import CompleteProfile from "@/pages/CompleteProfile";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Profile from "@/pages/Profile";
import MyCoupons from "@/pages/MyCoupons";
import MyBooks from "@/pages/MyBooks";
import BookDetail from "@/pages/BookDetail";
import BookRecipes from "@/pages/BookRecipes";
import RecipeDetail from "@/pages/RecipeDetail";
import FavoriteRecipes from "@/pages/FavoriteRecipes";
import MealPlans from "@/pages/MealPlans";
import MealPlanDetail from "@/pages/MealPlanDetail";
import { AppSidebar } from "@/components/AppSidebar";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StrictMode } from "react";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertTitle>Something went wrong!</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">{error.message}</p>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </AlertDescription>
    </Alert>
  );
}

function AuthenticatedApp() {
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
        <Route path="/favorite-recipes" element={<FavoriteRecipes />} />
        <Route path="/meal-plans" element={<MealPlans />} />
        <Route path="/meal-plan/:id" element={<MealPlanDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppSidebar>
  );
}

function RouterApp() {
  const { isAuthenticated } = useAuthState();

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <>
      {isAuthenticated ? (
        <ProtectedRoutes>
          <AuthenticatedApp />
        </ProtectedRoutes>
      ) : (
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  // Create a new QueryClient instance for each app instance
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  return (
    <StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <RouterApp />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

export default App;