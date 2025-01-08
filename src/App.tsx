import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoutes } from "@/components/auth/ProtectedRoutes";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Profile from "@/pages/Profile";
import CompleteProfile from "@/pages/CompleteProfile";
import MyBooks from "@/pages/MyBooks";
import MyCoupons from "@/pages/MyCoupons";
import BookDetail from "@/pages/BookDetail";
import BookRecipes from "@/pages/BookRecipes";
import RecipeDetail from "@/pages/RecipeDetail";
import FavoriteRecipes from "@/pages/FavoriteRecipes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<ProtectedRoutes>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/my-books" element={<MyBooks />} />
              <Route path="/my-coupons" element={<MyCoupons />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/book/:id/recipes" element={<BookRecipes />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/favorite-recipes" element={<FavoriteRecipes />} />
            </Routes>
          </ProtectedRoutes>} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;