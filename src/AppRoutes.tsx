import { Routes, Route } from "react-router-dom";
import { ProtectedRoutes } from "@/components/auth/ProtectedRoutes";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import CompleteProfile from "@/pages/CompleteProfile";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import BookDetail from "@/pages/BookDetail";
import BookRecipes from "@/pages/BookRecipes";
import MyBooks from "@/pages/MyBooks";
import MyCoupons from "@/pages/MyCoupons";
import RecipeDetail from "@/pages/RecipeDetail";
import FavoriteRecipes from "@/pages/FavoriteRecipes";
import MealPlans from "@/pages/MealPlans";
import MealPlanDetail from "@/pages/MealPlanDetail";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoutes>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/book/:id/recipes" element={<BookRecipes />} />
              <Route path="/my-books" element={<MyBooks />} />
              <Route path="/my-coupons" element={<MyCoupons />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/favorites" element={<FavoriteRecipes />} />
              <Route path="/meal-plans" element={<MealPlans />} />
              <Route path="/meal-plan/:id" element={<MealPlanDetail />} />
            </Routes>
          </ProtectedRoutes>
        }
      />
    </Routes>
  );
};

export default AppRoutes;