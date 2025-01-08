import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ProtectedRoutes } from "@/components/auth/ProtectedRoutes";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import CompleteProfile from "@/pages/CompleteProfile";
import MyBooks from "@/pages/MyBooks";
import MyCoupons from "@/pages/MyCoupons";
import Favorites from "@/pages/Favorites";
import BookDetail from "@/pages/BookDetail";
import BookRecipes from "@/pages/BookRecipes";
import RecipeDetail from "@/pages/RecipeDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          element={
            <ProtectedRoutes>
              <Outlet />
            </ProtectedRoutes>
          }
        >
          <Route
            element={
              <AuthLayout>
                <Outlet />
              </AuthLayout>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/my-books" element={<MyBooks />} />
            <Route path="/my-coupons" element={<MyCoupons />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/book/:id/recipes" element={<BookRecipes />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}
