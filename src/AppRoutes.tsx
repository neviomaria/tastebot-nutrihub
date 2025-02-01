import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Index";
import BookRecipes from "@/pages/BookRecipes";
import RecipeDetail from "@/pages/RecipeDetail";
import CookWithIngredients from "@/pages/CookWithIngredients";
import Profile from "@/pages/Profile";
import MyBooks from "@/pages/MyBooks";
import MyCoupons from "@/pages/MyCoupons";
import FavoriteRecipes from "@/pages/FavoriteRecipes";
import MealPlans from "@/pages/MealPlans";
import Timers from "@/pages/Timers";
import ShoppingLists from "@/pages/ShoppingLists";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/book/:id" element={<BookRecipes />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/cook-with-ingredients" element={<CookWithIngredients />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-books" element={<MyBooks />} />
      <Route path="/my-coupons" element={<MyCoupons />} />
      <Route path="/favorite-recipes" element={<FavoriteRecipes />} />
      <Route path="/meal-plans" element={<MealPlans />} />
      <Route path="/timers" element={<Timers />} />
      <Route path="/shopping-lists" element={<ShoppingLists />} />
    </Routes>
  );
}