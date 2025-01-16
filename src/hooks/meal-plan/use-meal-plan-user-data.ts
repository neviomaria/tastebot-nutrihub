import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { CreateMealPlanFormValues } from "@/schemas/meal-plan";

interface UserBook {
  book_id: string;
  book_title: string;
}

export const useMealPlanUserData = (form: UseFormReturn<CreateMealPlanFormValues>) => {
  // Fetch user profile for preferences
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("allergies, favorite_cuisines")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    meta: {
      onSuccess: (data) => {
        // Set excluded ingredients from allergies, filtering out "None" and "Other"
        const selectedAllergies = data?.allergies?.filter(allergy => 
          allergy !== "None" && allergy !== "Other"
        ) || [];
        form.setValue("excluded_ingredients", selectedAllergies);
        
        // Set preferred cuisines, filtering out "Other"
        const selectedCuisines = data?.favorite_cuisines?.filter(cuisine => 
          cuisine !== "Other"
        ) || [];
        form.setValue("preferred_cuisines", selectedCuisines);
      }
    }
  });

  // Fetch user's books
  const { data: userBooks = [] } = useQuery({
    queryKey: ["userBooks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Fetch profile book
      const { data: profile } = await supabase
        .from("profiles")
        .select("book_id, book_title")
        .eq("id", user.id)
        .single();

      // Fetch additional books from user_coupons
      const { data: userCoupons } = await supabase
        .from("user_coupons")
        .select("book_id, book_title")
        .eq("user_id", user.id);

      // Combine books, ensuring no duplicates
      let allBooks: UserBook[] = [];
      if (profile?.book_id) {
        allBooks.push({
          book_id: profile.book_id,
          book_title: profile.book_title || ''
        });
      }
      if (userCoupons) {
        userCoupons.forEach(coupon => {
          if (!allBooks.some(book => book.book_id === coupon.book_id)) {
            allBooks.push({
              book_id: coupon.book_id,
              book_title: coupon.book_title
            });
          }
        });
      }

      return allBooks;
    }
  });

  return { profile, userBooks };
};