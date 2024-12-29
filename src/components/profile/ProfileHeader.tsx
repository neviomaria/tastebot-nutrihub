import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
}

export const ProfileHeader = ({ avatarUrl, firstName, lastName }: ProfileHeaderProps) => {
  const getInitials = () => {
    const firstInitial = firstName?.[0]?.toUpperCase() || '';
    const lastInitial = lastName?.[0]?.toUpperCase() || '';
    return firstInitial + lastInitial || 'U';
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};