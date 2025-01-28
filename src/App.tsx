import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/CookieBanner";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthState } from "@/hooks/use-auth-state";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppRoutes from "./AppRoutes";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function AppContent() {
  const { isAuthenticated } = useAuthState();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        console.log("[AppContent] Starting session check...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log("[AppContent] Session check result:", session ? "Active" : "No session", error || "");
        
        if (error) {
          console.error("[AppContent] Session check error:", error);
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "Please try logging in again",
          });
          await supabase.auth.signOut();
          setIsInitialized(true);
          return;
        }

        if (!session) {
          console.log("[AppContent] No active session found");
          setIsInitialized(true);
          return;
        }

        console.log("[AppContent] Session user:", session.user.email);
        setIsInitialized(true);
      } catch (error) {
        console.error("[AppContent] Session check failed:", error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AppContent] Auth state changed:", event, session?.user?.email || "No user");
      
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  console.log("[AppContent] Current auth state:", isAuthenticated, "Initialized:", isInitialized);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {isAuthenticated && <AppSidebar />}
        <main className="flex-1 overflow-auto bg-background min-h-screen w-full">
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