import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoutes } from '@/components/auth/ProtectedRoutes';
import { AuthLayout } from '@/components/auth/AuthLayout';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import CompleteProfile from '@/pages/CompleteProfile';
import MyBooks from '@/pages/MyBooks';
import MyCoupons from '@/pages/MyCoupons';
import Favorites from '@/pages/Favorites';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<ProtectedRoutes />}>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/my-books" element={<MyBooks />} />
            <Route path="/my-coupons" element={<MyCoupons />} />
            <Route path="/favorites" element={<Favorites />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;