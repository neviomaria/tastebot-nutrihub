import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  avatarUrl?: string;
  firstName?: string;
}

export const ProfileHeader = ({ avatarUrl, firstName }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          {firstName?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};