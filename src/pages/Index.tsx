import { useEffect } from "react";
import { ProfileCompletionWidget } from "@/components/widgets/ProfileCompletionWidget";
import { UserBooksWidget } from "@/components/widgets/UserBooksWidget";
import { BookRecipesWidget } from "@/components/widgets/BookRecipesWidget";
import { AvailableBooksWidget } from "@/components/widgets/AvailableBooksWidget";
import { useAuthState } from "@/hooks/use-auth-state";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { isAuthenticated } = useAuthState();
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("Index page mounted, auth status:", isAuthenticated);
    
    if (isAuthenticated === false) {
      console.log("User not authenticated, showing toast");
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to view your dashboard",
      });
      return;
    }
    
    console.log("Attempting to render dashboard widgets");
  }, [isAuthenticated, toast]);

  // Only render content when authentication state is determined
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to Pybher</h1>
        <div className="space-y-8">
          {/* Profile and Books Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileCompletionWidget />
            <UserBooksWidget />
          </div>
          
          {/* Recipes Row */}
          <div className="w-full">
            <BookRecipesWidget />
          </div>
          
          {/* Available Books Row */}
          <div className="w-full">
            <AvailableBooksWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;