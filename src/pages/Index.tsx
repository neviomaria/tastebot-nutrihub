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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Pybher</h1>
          <p className="text-lg text-gray-600">
            Your personal recipe and meal planning assistant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;