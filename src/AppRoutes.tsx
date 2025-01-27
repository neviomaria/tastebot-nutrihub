import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import RecipeDetail from "@/pages/RecipeDetail";
import Timers from "@/pages/Timers";
import MyCoupons from "@/pages/MyCoupons";
import MyBooks from "@/pages/MyBooks";
import FavoriteRecipes from "@/pages/FavoriteRecipes";
import MealPlans from "@/pages/MealPlans";
import BookDetail from "@/pages/BookDetail";
import BookRecipes from "@/pages/BookRecipes";

interface ProtectedRoutesProps {
  children: React.ReactNode;
}

const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <Index />
          </ProtectedRoutes>
        }
      />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoutes>
            <Profile />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/recipe/:id"
        element={
          <ProtectedRoutes>
            <RecipeDetail />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/timers"
        element={
          <ProtectedRoutes>
            <Timers />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/my-coupons"
        element={
          <ProtectedRoutes>
            <MyCoupons />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/my-books"
        element={
          <ProtectedRoutes>
            <MyBooks />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/favorite-recipes"
        element={
          <ProtectedRoutes>
            <FavoriteRecipes />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/meal-plans"
        element={
          <ProtectedRoutes>
            <MealPlans />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/book/:id"
        element={
          <ProtectedRoutes>
            <BookDetail />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/book/:id/recipes"
        element={
          <ProtectedRoutes>
            <BookRecipes />
          </ProtectedRoutes>
        }
      />
    </Routes>
  );
};

export default AppRoutes;