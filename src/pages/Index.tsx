import { ProfileCompletionWidget } from "@/components/widgets/ProfileCompletionWidget";

const Index = () => {
  return (
    <div className="min-h-screen animate-fade-up space-y-8 bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold gradient-text mb-8 text-center">
          Welcome to FlavorFit
        </h1>
        <div className="grid grid-cols-1 gap-6">
          <ProfileCompletionWidget />
        </div>
      </div>
    </div>
  );
};

export default Index;