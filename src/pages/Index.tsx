import { useAuthState } from "@/hooks/use-auth-state";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated } = useAuthState();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isAuthenticated === false) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to view your dashboard",
      });
    }
  }, [isAuthenticated, toast]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-purple-600 flex items-center justify-center">
        <div className="text-white text-6xl font-bold animate-bounce">
          LOADING...
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-purple-600 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-12">
        <h1 className="text-7xl font-black text-purple-600 mb-8 text-center">
          DEPLOYMENT TEST
        </h1>
        <div className="text-2xl text-center space-y-4">
          <p>
            If you can see this purple page with large text,
            <br />
            the deployment is working!
          </p>
          <p className="text-purple-600 font-bold">
            Time: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;