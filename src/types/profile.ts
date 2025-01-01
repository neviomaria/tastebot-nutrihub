export interface ProfileData {
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
  id: string | null;
  coupon_code: string | null;
  book_id: string | null;
  access_level: string | null;
}