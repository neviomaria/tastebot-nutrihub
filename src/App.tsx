import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/CookieBanner";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthState } from "@/hooks/use-auth-state";
import AppRoutes from "./AppRoutes";
import "./App.css";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated } = useAuthState();
  console.log("AppContent rendering, isAuthenticated:", isAuthenticated);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {isAuthenticated && <AppSidebar />}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-background min-h-screen w-full">
          <AppRoutes />
        </main>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster />
        <CookieBanner />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;