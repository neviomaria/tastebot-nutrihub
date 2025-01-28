import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "./profile/ProfileHeader";
import { Link } from "react-router-dom";

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
    <div className="flex items-center justify-end gap-2 p-2 lg:p-4">
      <span className="text-sm font-medium truncate hidden sm:block text-white">
        {profile?.first_name} {profile?.last_name}
      </span>
      <Link to="/profile" className="flex items-center">
        <ProfileHeader
          avatarUrl={profile?.avatar_url}
          firstName={profile?.first_name}
          lastName={profile?.last_name}
        />
      </Link>
    </div>
  );
};