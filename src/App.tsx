import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import AppRoutes from "./AppRoutes";
import { AppHeader } from "./components/AppHeader";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthState } from "@/hooks/use-auth-state";
import "./App.css";

const queryClient = new QueryClient();

// Create a wrapper component to handle authenticated layout
const AuthenticatedLayout = () => {
  // Move the auth state check inside the Router context
  const { isAuthenticated } = useAuthState();

  return (
    <div className="flex h-screen w-full">
      {isAuthenticated && <AppSidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAuthenticated && <AppHeader />}
        <main className="flex-1 overflow-auto">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider>
          <AuthenticatedLayout />
          <Toaster />
          <SonnerToaster />
        </SidebarProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;