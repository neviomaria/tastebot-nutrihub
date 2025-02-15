import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "@/hooks/use-auth-state";
import Home from "@/pages/Index";
import BookRecipes from "@/pages/BookRecipes";
import BookDetail from "@/pages/BookDetail";
import RecipeDetail from "@/pages/RecipeDetail";
import CookWithIngredients from "@/pages/CookWithIngredients";
import Profile from "@/pages/Profile";
import CompleteProfile from "@/pages/CompleteProfile";
import MyBooks from "@/pages/MyBooks";
import MyCoupons from "@/pages/MyCoupons";
import FavoriteRecipes from "@/pages/FavoriteRecipes";
import MealPlans from "@/pages/MealPlans"; 
import Timers from "@/pages/Timers";
import ShoppingLists from "@/pages/ShoppingLists";
import Auth from "@/pages/Auth";

export function AppRoutes() {
  const { isAuthenticated } = useAuthState();

  // If authentication is still loading, show nothing
  if (isAuthenticated === null) {
    return null;
  }

  // If not authenticated, redirect to auth page
  if (isAuthenticated === false) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Protected routes for authenticated users
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/book/:id" element={<BookDetail />} />
      <Route path="/book/:id/recipes" element={<BookRecipes />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/cook-with-ingredients" element={<CookWithIngredients />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/my-books" element={<MyBooks />} />
      <Route path="/my-coupons" element={<MyCoupons />} />
      <Route path="/favorite-recipes" element={<FavoriteRecipes />} />
      <Route path="/meal-plans" element={<MealPlans />} />
      <Route path="/timers" element={<Timers />} />
      <Route path="/shopping-lists" element={<ShoppingLists />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
