import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import Profile from '@/pages/Profile';
import CompleteProfile from '@/pages/CompleteProfile';
import BookDetail from '@/pages/BookDetail';
import BookRecipes from '@/pages/BookRecipes';
import MyCoupons from '@/pages/MyCoupons';
import MyBooks from '@/pages/MyBooks';
import RecipeDetail from '@/pages/RecipeDetail';
import { ProtectedRoutes } from '@/components/auth/ProtectedRoutes';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes with and without trailing slash */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/" element={<Navigate to="/auth" replace />} />
        
        {/* Auth callback routes with and without trailing slash */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/callback/" element={<Navigate to="/auth/callback" replace />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Index />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoutes>
              <Profile />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoutes>
              <CompleteProfile />
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
          path="/recipe/:id"
          element={
            <ProtectedRoutes>
              <RecipeDetail />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;