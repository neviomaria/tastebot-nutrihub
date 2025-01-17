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
    <Avatar className="h-8 w-8 lg:h-12 lg:w-12">
      <AvatarImage src={avatarUrl} />
      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs lg:text-base">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};