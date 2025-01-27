import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/CookieBanner";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppRoutes from "./AppRoutes";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <AppSidebar>
              <main className="flex-1 w-full overflow-auto bg-background">
                <AppRoutes />
              </main>
            </AppSidebar>
          </div>
        </SidebarProvider>
        <Toaster />
        <CookieBanner />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;