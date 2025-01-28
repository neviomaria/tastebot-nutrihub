import { useEffect } from "react";
import { useAuthState } from "@/hooks/use-auth-state";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  console.log("[Index] ========== RENDER START ==========");
  const { isAuthenticated } = useAuthState();
  const { toast } = useToast();
  
  console.log("[Index] Current authentication state:", isAuthenticated);
  
  useEffect(() => {
    console.log("[Index] useEffect triggered with auth state:", isAuthenticated);
    
    if (isAuthenticated === false) {
      console.log("[Index] User not authenticated, showing toast");
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to view your dashboard",
      });
      return;
    }
    
    if (isAuthenticated === true) {
      console.log("[Index] User is authenticated, proceeding with render");
    }
  }, [isAuthenticated, toast]);

  // Loading state
  if (isAuthenticated === null) {
    console.log("[Index] Auth state is null, showing loading spinner");
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  // Not authenticated state
  if (isAuthenticated === false) {
    console.log("[Index] Auth state is false, returning null");
    return null;
  }

  console.log("[Index] Rendering dashboard content");
  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-center transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-5xl font-bold mb-6 text-primary">Welcome to Pybher</h1>
          <p className="text-xl text-gray-600">
            Your personal recipe and meal planning assistant
          </p>
          <div className="mt-8 p-4 bg-secondary rounded-lg">
            <p className="text-lg text-secondary-foreground">
              Debug Info:
              <br />
              Authentication State: {String(isAuthenticated)}
              <br />
              Render Time: {new Date().toISOString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;