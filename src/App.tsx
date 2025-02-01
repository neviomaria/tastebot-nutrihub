import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AppRoutes } from "./AppRoutes";
import { AppHeader } from "./components/AppHeader";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthState } from "@/hooks/use-auth-state";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated } = useAuthState();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex h-screen w-full">
            {isAuthenticated && <AppSidebar />}
            <div className="flex-1 flex flex-col overflow-hidden">
              {isAuthenticated && <AppHeader />}
              <main className="flex-1 overflow-auto">
                <AppRoutes />
              </main>
            </div>
          </div>
          <Toaster />
          <SonnerToaster />
        </SidebarProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;