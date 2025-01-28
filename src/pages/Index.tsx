import { useAuthState } from "@/hooks/use-auth-state";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ProfileCompletionWidget } from "@/components/widgets/ProfileCompletionWidget";
import { UserBooksWidget } from "@/components/widgets/UserBooksWidget";
import { BookRecipesWidget } from "@/components/widgets/BookRecipesWidget";
import { AvailableBooksWidget } from "@/components/widgets/AvailableBooksWidget";

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Profile Completion Section */}
      <section>
        <ProfileCompletionWidget />
      </section>
      
      {/* Books and Recipes Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <UserBooksWidget />
        <BookRecipesWidget />
      </div>
      
      {/* Available Books Section */}
      <section className="mt-8">
        <AvailableBooksWidget />
      </section>
    </div>
  );
};

export default Index;