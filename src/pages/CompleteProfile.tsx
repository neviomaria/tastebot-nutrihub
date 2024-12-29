import { ProfileForm } from "@/components/profile/ProfileForm";

const CompleteProfile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Help us personalize your nutrition journey
          </p>
        </div>

        <ProfileForm />
      </div>
    </div>
  );
};

export default CompleteProfile;