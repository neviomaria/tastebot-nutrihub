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
      favorites: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_items: {
        Row: {
          calories_per_serving: number | null
          created_at: string | null
          day_of_week: number
          id: string
          meal_plan_id: string
          meal_type: string
          recipe_id: number
          servings: number
        }
        Insert: {
          calories_per_serving?: number | null
          created_at?: string | null
          day_of_week: number
          id?: string
          meal_plan_id: string
          meal_type: string
          recipe_id: number
          servings?: number
        }
        Update: {
          calories_per_serving?: number | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          meal_plan_id?: string
          meal_type?: string
          recipe_id?: number
          servings?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          calculated_calories: boolean | null
          created_at: string | null
          daily_calories: number | null
          duration: string | null
          end_date: string
          excluded_ingredients: string[] | null
          id: string
          meals_per_day: string[] | null
          objective: string | null
          preferred_cuisines: string[] | null
          selected_books: string[] | null
          start_date: string
          status: string | null
          time_constraint: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          calculated_calories?: boolean | null
          created_at?: string | null
          daily_calories?: number | null
          duration?: string | null
          end_date: string
          excluded_ingredients?: string[] | null
          id?: string
          meals_per_day?: string[] | null
          objective?: string | null
          preferred_cuisines?: string[] | null
          selected_books?: string[] | null
          start_date: string
          status?: string | null
          time_constraint?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          calculated_calories?: boolean | null
          created_at?: string | null
          daily_calories?: number | null
          duration?: string | null
          end_date?: string
          excluded_ingredients?: string[] | null
          id?: string
          meals_per_day?: string[] | null
          objective?: string | null
          preferred_cuisines?: string[] | null
          selected_books?: string[] | null
          start_date?: string
          status?: string | null
          time_constraint?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
          onboarding_completed: boolean | null
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
          onboarding_completed?: boolean | null
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
          onboarding_completed?: boolean | null
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
      recipes: {
        Row: {
          book_title: string | null
          cook_time: string | null
          created_at: string | null
          description: string | null
          id: number
          ingredients: string[]
          instructions: string[]
          meal_type: string | null
          prep_time: string | null
          servings: number | null
          title: string
          user_id: string | null
        }
        Insert: {
          book_title?: string | null
          cook_time?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          ingredients?: string[]
          instructions?: string[]
          meal_type?: string | null
          prep_time?: string | null
          servings?: number | null
          title: string
          user_id?: string | null
        }
        Update: {
          book_title?: string | null
          cook_time?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          ingredients?: string[]
          instructions?: string[]
          meal_type?: string | null
          prep_time?: string | null
          servings?: number | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          checked: boolean | null
          created_at: string | null
          id: string
          ingredient: string
          quantity: string | null
          recipe_id: number | null
          shopping_list_id: string
        }
        Insert: {
          checked?: boolean | null
          created_at?: string | null
          id?: string
          ingredient: string
          quantity?: string | null
          recipe_id?: number | null
          shopping_list_id: string
        }
        Update: {
          checked?: boolean | null
          created_at?: string | null
          id?: string
          ingredient?: string
          quantity?: string | null
          recipe_id?: number | null
          shopping_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      timers: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_coupons: {
        Row: {
          book_id: string
          book_title: string
          coupon_code: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          book_title: string
          coupon_code: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          book_title?: string
          coupon_code?: string
          created_at?: string | null
          id?: string
          user_id?: string
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
