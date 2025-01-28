import { useAuthState } from "@/hooks/use-auth-state";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const Index = () => {
  const { isAuthenticated } = useAuthState();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    if (isAuthenticated === false) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to view your dashboard",
      });
    }
  }, [isAuthenticated, toast]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center">
        <div className="text-black text-6xl font-bold animate-bounce">
          LOADING...
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-yellow-400 p-8">
      <div className="max-w-4xl mx-auto bg-black rounded-xl shadow-2xl p-12">
        <h1 className="text-7xl font-black text-yellow-400 mb-8 text-center">
          DEPLOYMENT TEST - YELLOW VERSION
        </h1>
        <div className="text-2xl text-center space-y-4 text-yellow-400">
          <p>
            If you can see this YELLOW page with BLACK background,
            <br />
            the deployment is working!
          </p>
          <p className="text-4xl font-bold">
            Current Time: {currentTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;