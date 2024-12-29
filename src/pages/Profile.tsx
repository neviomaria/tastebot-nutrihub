import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  dietary_preferences: string[] | null;
  other_dietary_preferences: string | null;
  allergies: string[] | null;
  other_allergies: string | null;
  health_goal: string | null;
  activity_level: string | null;
  planning_preference: string | null;
  favorite_cuisines: string[] | null;
  other_cuisines: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        
        // Ensure all fields are present in the profile data
        const profileData: ProfileData = {
          first_name: data.first_name,
          last_name: data.last_name,
          avatar_url: data.avatar_url,
          dietary_preferences: data.dietary_preferences,
          other_dietary_preferences: data.other_dietary_preferences,
          allergies: data.allergies,
          other_allergies: data.other_allergies,
          health_goal: data.health_goal,
          activity_level: data.activity_level,
          planning_preference: data.planning_preference,
          favorite_cuisines: data.favorite_cuisines,
          other_cuisines: data.other_cuisines,
        };
        
        setProfile(profileData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="container max-w-2xl py-8 space-y-6">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatArrayField = (array: string[] | null, otherValue: string | null) => {
    if (!array) return "None";
    const items = array.filter(item => item !== "Other");
    if (otherValue) {
      items.push(otherValue);
    }
    return items.join(", ");
  };

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <ProfileHeader
        avatarUrl={profile.avatar_url}
        firstName={profile.first_name}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
              <p className="mt-1">
                {profile.first_name && profile.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : "Not set"}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Dietary Preferences</h3>
              <p className="mt-1">{formatArrayField(profile.dietary_preferences, profile.other_dietary_preferences)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Allergies</h3>
              <p className="mt-1">{formatArrayField(profile.allergies, profile.other_allergies)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Health Goal</h3>
              <p className="mt-1">{profile.health_goal || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Activity Level</h3>
              <p className="mt-1">{profile.activity_level || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Planning Preference</h3>
              <p className="mt-1">{profile.planning_preference || "Not set"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Favorite Cuisines</h3>
              <p className="mt-1">{formatArrayField(profile.favorite_cuisines, profile.other_cuisines)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;