import { useAuthState } from "@/hooks/use-auth-state";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ProfileCompletionWidget } from "@/components/widgets/ProfileCompletionWidget";
import { UserBooksWidget } from "@/components/widgets/UserBooksWidget";
import { BookRecipesWidget } from "@/components/widgets/BookRecipesWidget";
import { AvailableBooksWidget } from "@/components/widgets/AvailableBooksWidget";

const Index = () => {
  console.log("[Index] Starting render");
  const { isAuthenticated } = useAuthState();
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("[Index] useEffect running, isAuthenticated:", isAuthenticated);
    if (isAuthenticated === false) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to view your dashboard",
      });
    }
  }, [isAuthenticated, toast]);

  console.log("[Index] Auth state:", isAuthenticated);

  if (isAuthenticated === null) {
    console.log("[Index] Loading state");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    console.log("[Index] Not authenticated");
    return null;
  }

  console.log("[Index] Rendering dashboard");
  return (
    <div className="container mx-auto p-6 space-y-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Profile Completion Section */}
      <section className="mb-8">
        <ProfileCompletionWidget />
      </section>
      
      {/* Books and Recipes Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* User's Books */}
        <div className="space-y-6">
          <UserBooksWidget />
        </div>
        
        {/* Featured Recipes */}
        <div className="space-y-6">
          <BookRecipesWidget />
        </div>
      </div>
      
      {/* Available Books Section */}
      <section className="mt-8">
        <AvailableBooksWidget />
      </section>
    </div>
  );
};

export default Index;