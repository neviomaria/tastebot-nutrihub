import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import AppRoutes from "./AppRoutes"; // Changed to default import
import { AppHeader } from "./components/AppHeader";
import { AppSidebar } from "./components/AppSidebar";
import { OnboardingDialog } from "./components/onboarding/OnboardingDialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <AppHeader />
              <main className="flex-1 overflow-auto">
                <AppRoutes />
              </main>
            </div>
          </div>
          <OnboardingDialog />
          <Toaster />
          <SonnerToaster />
        </SidebarProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;