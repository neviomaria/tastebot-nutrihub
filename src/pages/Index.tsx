import { ProfileCompletionWidget } from "@/components/widgets/ProfileCompletionWidget";
import { UserBooksWidget } from "@/components/widgets/UserBooksWidget";
import { BookRecipesWidget } from "@/components/widgets/BookRecipesWidget";
import { AvailableBooksWidget } from "@/components/widgets/AvailableBooksWidget";

const Index = () => {
  console.log("Rendering Index page");
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Welcome to Pybher</h1>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileCompletionWidget />
            <UserBooksWidget />
          </div>
          <BookRecipesWidget />
          <AvailableBooksWidget />
        </div>
      </div>
    </div>
  );
};

export default Index;