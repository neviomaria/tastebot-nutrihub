export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          access_level: string | null
          activity_level: string | null
          allergies: string[] | null
          avatar_url: string | null
          book_id: string | null
          book_title: string | null
          cooking_skill_level: string | null
          country: string | null
          coupon_code: string | null
          created_at: string | null
          date_of_birth: string | null
          dietary_preferences: string[] | null
          email: string | null
          favorite_cuisines: string[] | null
          first_name: string | null
          gender: string | null
          grocery_budget: string | null
          health_goal: string | null
          height_cm: number | null
          id: string
          last_name: string | null
          meal_preferences: string[] | null
          medical_conditions: string[] | null
          other_allergies: string | null
          other_cuisines: string | null
          other_dietary_preferences: string | null
          other_medical_conditions: string | null
          planning_preference: string | null
          preferred_grocery_stores: string[] | null
          religious_restrictions: string[] | null
          weight_kg: number | null
        }
        Insert: {
          access_level?: string | null
          activity_level?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          book_id?: string | null
          book_title?: string | null
          cooking_skill_level?: string | null
          country?: string | null
          coupon_code?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          email?: string | null
          favorite_cuisines?: string[] | null
          first_name?: string | null
          gender?: string | null
          grocery_budget?: string | null
          health_goal?: string | null
          height_cm?: number | null
          id: string
          last_name?: string | null
          meal_preferences?: string[] | null
          medical_conditions?: string[] | null
          other_allergies?: string | null
          other_cuisines?: string | null
          other_dietary_preferences?: string | null
          other_medical_conditions?: string | null
          planning_preference?: string | null
          preferred_grocery_stores?: string[] | null
          religious_restrictions?: string[] | null
          weight_kg?: number | null
        }
        Update: {
          access_level?: string | null
          activity_level?: string | null
          allergies?: string[] | null
          avatar_url?: string | null
          book_id?: string | null
          book_title?: string | null
          cooking_skill_level?: string | null
          country?: string | null
          coupon_code?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dietary_preferences?: string[] | null
          email?: string | null
          favorite_cuisines?: string[] | null
          first_name?: string | null
          gender?: string | null
          grocery_budget?: string | null
          health_goal?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          meal_preferences?: string[] | null
          medical_conditions?: string[] | null
          other_allergies?: string | null
          other_cuisines?: string | null
          other_dietary_preferences?: string | null
          other_medical_conditions?: string | null
          planning_preference?: string | null
          preferred_grocery_stores?: string[] | null
          religious_restrictions?: string[] | null
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
