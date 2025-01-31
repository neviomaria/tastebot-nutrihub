import { Routes, Route, Outlet } from "react-router-dom";
import { ProtectedRoutes } from "@/components/auth/ProtectedRoutes";
import { AuthLayout } from "@/components/auth/AuthLayout";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import CompleteProfile from "@/pages/CompleteProfile";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import MyBooks from "@/pages/MyBooks";
import MyCoupons from "@/pages/MyCoupons";
import FavoriteRecipes from "@/pages/FavoriteRecipes";
import MealPlans from "@/pages/MealPlans";
import MealPlanDetail from "@/pages/MealPlanDetail";
import BookDetail from "@/pages/BookDetail";
import BookRecipes from "@/pages/BookRecipes";
import RecipeDetail from "@/pages/RecipeDetail";
import Timers from "@/pages/Timers";

export default function AppRoutes() { // Changed to default export
  console.log("[AppRoutes] Rendering routes");
  
  return (
    <Routes>
      <Route element={<AuthLayout><Outlet /></AuthLayout>}>
        <Route path="auth" element={<Auth />} />
        <Route path="auth/callback" element={<AuthCallback />} />
      </Route>

      <Route element={<ProtectedRoutes><Outlet /></ProtectedRoutes>}>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/my-books" element={<MyBooks />} />
        <Route path="/my-coupons" element={<MyCoupons />} />
        <Route path="/favorite-recipes" element={<FavoriteRecipes />} />
        <Route path="/meal-plans" element={<MealPlans />} />
        <Route path="/meal-plan/:id" element={<MealPlanDetail />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/book/:id/recipes" element={<BookRecipes />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/timers" element={<Timers />} />
      </Route>
    </Routes>
  );
}