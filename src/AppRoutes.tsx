import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Index";
import BookRecipes from "@/pages/BookRecipes";
import RecipeDetail from "@/pages/RecipeDetail";
import CookWithIngredients from "@/pages/CookWithIngredients";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/book/:id" element={<BookRecipes />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/cook-with-ingredients" element={<CookWithIngredients />} />
    </Routes>
  );
}
