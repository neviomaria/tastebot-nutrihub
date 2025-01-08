import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ChevronRight } from "lucide-react";

interface BookAccess {
  book_id: string;
  book_title: string;
}

export function UserBooksWidget() {
  const navigate = useNavigate();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['userBooks'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found in UserBooksWidget');
          return [];
        }

        console.log('Fetching books for user:', user.id);
        
        // Fetch profile book
        const { data: profile } = await supabase
          .from('profiles')
          .select('book_id, book_title')
          .eq('id', user.id)
          .single();

        // Fetch additional books from user_coupons
        const { data: userCoupons } = await supabase
          .from('user_coupons')
          .select('book_id, book_title')
          .eq('user_id', user.id);

        // Combine books, ensuring no duplicates
        let allBooks: BookAccess[] = [];
        if (profile?.book_id) {
          allBooks.push({
            book_id: profile.book_id,
            book_title: profile.book_title || ''
          });
        }
        if (userCoupons) {
          // Add books from coupons, avoiding duplicates
          userCoupons.forEach(coupon => {
            if (!allBooks.some(book => book.book_id === coupon.book_id)) {
              allBooks.push({
                book_id: coupon.book_id,
                book_title: coupon.book_title
              });
            }
          });
        }

        console.log('All books retrieved:', allBooks);
        return allBooks;
      } catch (error) {
        console.error('Error in books fetch:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1
  });

  const { data: bookCover } = useQuery({
    queryKey: ['bookCover', books.map(book => book.book_id)],
    queryFn: async () => {
      try {
        const coverUrls = await Promise.all(books.map(async (book) => {
          const bookResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/libri/${book.book_id}`);
          if (!bookResponse.ok) {
            console.error('Failed to fetch book details:', bookResponse.statusText);
            return "/placeholder.svg";
          }
          const bookData = await bookResponse.json();
          let coverUrl = "/placeholder.svg";
          if (bookData.acf?.copertina_libro) {
            const mediaResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/media/${bookData.acf.copertina_libro}`);
            if (mediaResponse.ok) {
              const media = await mediaResponse.json();
              coverUrl = media.media_details?.sizes?.["cover-app"]?.source_url || media.source_url || coverUrl;
            }
          }
          return coverUrl;
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

  if (isLoading) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book, index) => (
              <Card key={book.book_id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={bookCover[index] || "/placeholder.svg"}
                      alt={book.book_title}
                      className="w-full h-full object-cover aspect-[3/4]"
                      loading="lazy"
                      onError={(e) => {
                        console.log('Image failed to load:', bookCover[index]);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="py-4 px-4 flex flex-col">
                    <h2 className="text-lg font-semibold mb-2 line-clamp-2">{book.book_title}</h2>
                    <div className="mt-auto space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-between bg-gradient-to-r from-[#F5F5F7] to-[#FFFFFF] hover:from-[#EAEAEC] hover:to-[#F5F5F7]"
                        onClick={() => navigate(`/book/${book.book_id}`)}
                      >
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button 
                        className="w-full justify-between bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#7E69AB]"
                        onClick={() => navigate(`/book/${book.book_id}/recipes`)}
                      >
                        View Recipes
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No books available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
