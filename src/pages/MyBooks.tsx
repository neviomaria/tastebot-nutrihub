import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight } from "lucide-react";
import { UserBook, Book } from "@/types/book";

const fetchUserBooks = async (): Promise<UserBook[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    // Fetch profile book
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("book_id, book_title")
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    // Fetch additional books from user_coupons
    const { data: userCoupons, error: couponsError } = await supabase
      .from("user_coupons")
      .select("book_id, book_title");

    if (couponsError) {
      console.error("Error fetching user coupons:", couponsError);
      throw couponsError;
    }

    // Combine books, ensuring no duplicates
    const allBooks: UserBook[] = [];
    
    if (profile?.book_id && profile?.book_title) {
      allBooks.push({
        book_id: profile.book_id,
        book_title: profile.book_title
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
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

const MyBooks = () => {
  const { toast } = useToast();

  const { data: books = [], isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['userBooks'],
    queryFn: fetchUserBooks,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error("Books fetch error:", error);
        toast({
          title: "Error",
          description: "Unable to load books. Please try logging in again.",
          variant: "destructive",
        });
      }
    }
  });

  const { data: bookDetails = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ['bookDetails', books.map(book => book.book_id)],
    queryFn: async () => {
      return Promise.all(books.map(async (book) => {
        if (!book.book_id) {
          console.warn('Book ID is undefined, skipping fetch');
          return {
            ...book,
            subtitle: '',
            coverUrl: '/placeholder.svg'
          };
        }

        try {
          const bookResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/libri/${book.book_id}`);
          if (!bookResponse.ok) {
            console.error('Failed to fetch book details:', bookResponse.statusText);
            return {
              ...book,
              subtitle: '',
              coverUrl: '/placeholder.svg'
            };
          }
          
          const bookData = await bookResponse.json();
          let coverUrl = '/placeholder.svg';

          if (bookData.acf?.copertina_libro) {
            const mediaResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/media/${bookData.acf.copertina_libro}`);
            if (mediaResponse.ok) {
              const media = await mediaResponse.json();
              coverUrl = media.media_details?.sizes?.["cover-app"]?.source_url || media.source_url || '/placeholder.svg';
            }
          }

          return {
            id: book.book_id,
            title: book.book_title,
            subtitle: bookData.acf?.sottotitolo_per_sito || '',
            coverUrl
          };
        } catch (error) {
          console.error('Error fetching book details:', error);
          return {
            id: book.book_id,
            title: book.book_title,
            subtitle: '',
            coverUrl: '/placeholder.svg'
          };
        }
      }));
    },
    enabled: books.length > 0,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  if (profileError?.message?.includes('No active session')) {
    return <Navigate to="/auth" replace />;
  }

  const isLoading = isLoadingProfile || isLoadingBooks;

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">My Books</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr,1.5fr] gap-4">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <div className="py-4 pr-4 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="space-y-2">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">My Books</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookDetails.map((book: Book) => (
          <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="grid grid-cols-[1fr,1.5fr] gap-4">
                <div className="relative">
                  <img
                    src={book.coverUrl || '/placeholder.svg'}
                    alt={book.title}
                    className="w-full h-full object-cover aspect-[3/4]"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="py-4 pr-4 flex flex-col">
                  <h2 className="text-lg font-semibold mb-4 line-clamp-2">{book.title}</h2>
                  <div className="mt-auto flex flex-col gap-3">
                    <Link to={`/book/${book.id}`}>
                      <Button variant="outline" className="w-full justify-between">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/book/${book.id}/recipes`}>
                      <Button className="w-full justify-between">
                        View Recipes
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyBooks;