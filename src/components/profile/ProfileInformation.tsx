import { ProfileData } from "@/types/profile";

interface ProfileInformationProps {
  profile: ProfileData;
}

export const ProfileInformation = ({ profile }: ProfileInformationProps) => {
  const formatArrayField = (array: string[] | null, otherValue: string | null) => {
    if (!array) return "None";
    const items = array.filter(item => item !== "Other");
    if (otherValue) {
      items.push(otherValue);
    }
    return items.join(", ");
  };

  return (
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
  );
};