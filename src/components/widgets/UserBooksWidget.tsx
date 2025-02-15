import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BooksList } from "../books/BooksList";
import { EmptyBooksList } from "../books/EmptyBooksList";

interface BookAccess {
  book_id: string;
  book_title: string; 
}

export function UserBooksWidget() {
  console.log("[UserBooksWidget] Starting render");
  const { toast } = useToast();

  const { data: books = [], isLoading: isLoadingBooks, error: booksError } = useQuery({
    queryKey: ['userBooks'],
    queryFn: async () => {
      console.log("[UserBooksWidget] Fetching books data");
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[UserBooksWidget] No user found');
          return [];
        }

        console.log('[UserBooksWidget] Fetching books for user:', user.id);
        
        // Fetch profile book
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('book_id, book_title')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        // Fetch additional books from user_coupons
        const { data: userCoupons, error: couponsError } = await supabase
          .from('user_coupons')
          .select('book_id, book_title')
          .eq('user_id', user.id);

        if (couponsError) {
          console.error('Error fetching coupons:', couponsError);
          throw couponsError;
        }

        // Combine books, ensuring no duplicates
        let allBooks: BookAccess[] = [];
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

        console.log('[UserBooksWidget] Books retrieved:', allBooks);
        return allBooks;
      } catch (error) {
        console.error('[UserBooksWidget] Error in books fetch:', error);
        throw error;
      }
    },
    retry: 1
  });

  const { data: bookCovers = [], isLoading: isLoadingCovers } = useQuery({
    queryKey: ['bookCovers', books.map(book => book.book_id)],
    queryFn: async () => {
      try {
        const coverUrls = await Promise.all(books.map(async (book) => {
          try {
            const bookResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/libri/${book.book_id}`);
            if (!bookResponse.ok) {
              console.error('Failed to fetch book details:', bookResponse.statusText);
              return "/placeholder.svg";
            }
            const bookData = await bookResponse.json();
            if (!bookData.acf?.copertina_libro) {
              return "/placeholder.svg";
            }
            const mediaResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/media/${bookData.acf.copertina_libro}`);
            if (!mediaResponse.ok) {
              return "/placeholder.svg";
            }
            const media = await mediaResponse.json();
            return media.media_details?.sizes?.["cover-app"]?.source_url || media.source_url || "/placeholder.svg";
          } catch (error) {
            console.error('Error fetching book cover:', error);
            return "/placeholder.svg";
          }
        }));
        return coverUrls;
      } catch (error) {
        console.error('Error fetching book covers:', error);
        return books.map(() => "/placeholder.svg");
      }
    },
    enabled: books.length > 0,
    staleTime: 1000 * 60 * 30 // Cache for 30 minutes
  });

  if (booksError) {
    console.error("[UserBooksWidget] Error state:", booksError);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load books. Please try again later."
    });
    return null;
  }

  const isLoading = isLoadingBooks || isLoadingCovers;

  if (isLoading) {
    console.log("[UserBooksWidget] Loading state");
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("[UserBooksWidget] Rendering component with books:", books.length);
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Books
        </CardTitle>
      </CardHeader>
      <CardContent>
        {books.length > 0 ? (
          <BooksList books={books} bookCovers={bookCovers} />
        ) : (
          <EmptyBooksList />
        )}
      </CardContent>
    </Card>
  );
}
