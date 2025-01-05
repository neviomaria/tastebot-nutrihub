import { ProfileCompletionWidget } from "@/components/widgets/ProfileCompletionWidget";
import { UserBooksWidget } from "@/components/widgets/UserBooksWidget";
import { BookRecipesWidget } from "@/components/widgets/BookRecipesWidget";
import { AvailableBooksWidget } from "@/components/widgets/AvailableBooksWidget";

const Index = () => {
  return (
    <div className="min-h-screen animate-fade-up space-y-8 bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
          Welcome to Pybher
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ProfileCompletionWidget />
          <UserBooksWidget />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <AvailableBooksWidget />
          <BookRecipesWidget />
        </div>
      </div>
    </div>
  );
};

export default Index;