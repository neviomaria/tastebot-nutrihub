import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "./profile/ProfileHeader";

export const AppHeader = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="sticky top-0 z-50 bg-white border-b flex items-center justify-end gap-2 p-2 lg:p-4 shadow-sm">
      <span className="text-sm font-medium truncate hidden sm:block">
        {profile?.first_name} {profile?.last_name}
      </span>
      <div className="flex items-center">
        <ProfileHeader
          avatarUrl={profile?.avatar_url}
          firstName={profile?.first_name}
          lastName={profile?.last_name}
        />
      </div>
    </div>
  );
};