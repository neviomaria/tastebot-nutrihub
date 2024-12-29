import { ProfileCompletionWidget } from "@/components/widgets/ProfileCompletionWidget";

const Index = () => {
  return (
    <div className="h-full animate-fade-up space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileCompletionWidget />
      </div>
    </div>
  );
};

export default Index;