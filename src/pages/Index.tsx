import { ProfileCompletionWidget } from "@/components/widgets/ProfileCompletionWidget";
import { UserBooksWidget } from "@/components/widgets/UserBooksWidget";
import { BookRecipesWidget } from "@/components/widgets/BookRecipesWidget";
import { AvailableBooksWidget } from "@/components/widgets/AvailableBooksWidget";

const Index = () => {
  return (
    <div className="min-h-screen animate-fade-up space-y-8 bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
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