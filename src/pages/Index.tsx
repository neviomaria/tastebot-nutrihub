import { useEffect } from "react";
import { useAuthState } from "@/hooks/use-auth-state";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  console.log("🔴 [Index] ========== RENDER START ==========");
  const { isAuthenticated } = useAuthState();
  const { toast } = useToast();
  
  console.log("🔴 [Index] Current authentication state:", isAuthenticated);
  
  useEffect(() => {
    console.log("🔴 [Index] useEffect triggered with auth state:", isAuthenticated);
    
    if (isAuthenticated === false) {
      console.log("🔴 [Index] User not authenticated, showing toast");
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to view your dashboard",
      });
      return;
    }
    
    if (isAuthenticated === true) {
      console.log("🔴 [Index] User is authenticated, proceeding with render");
    }
  }, [isAuthenticated, toast]);

  // Loading state
  if (isAuthenticated === null) {
    console.log("🔴 [Index] Auth state is null, showing loading spinner");
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="text-white text-4xl font-bold">LOADING...</div>
      </div>
    );
  }

  // Not authenticated state
  if (isAuthenticated === false) {
    console.log("🔴 [Index] Auth state is false, returning null");
    return null;
  }

  console.log("🔴 [Index] Rendering dashboard content");
  return (
    <div className="min-h-screen bg-red-500">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
          <h1 className="text-6xl font-bold mb-6 text-red-500">TEST PAGE</h1>
          <p className="text-3xl text-gray-600">
            If you can see this red page, the deployment is working!
          </p>
          <div className="mt-8 p-4 bg-red-100 rounded-lg">
            <p className="text-xl">
              Debug Info:
              <br />
              Authentication State: {String(isAuthenticated)}
              <br />
              Render Time: {new Date().toISOString()}
              <br />
              User Email: {window.localStorage.getItem('supabase.auth.token') ? 'Token exists' : 'No token'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;