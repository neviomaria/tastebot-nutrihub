import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight } from "lucide-react";

interface Book {
  title: string;
  subtitle: string;
  coverUrl: string;
  id: string;
}

const fetchUserProfile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("book_id, book_title")
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

const fetchBookDetails = async (bookId: string) => {
  try {
    const bookResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/libri/${bookId}`);
    if (!bookResponse.ok) throw new Error("Failed to fetch book details");
    const book = await bookResponse.json();

    let coverUrl = "/placeholder.svg";
    if (book.acf?.copertina_libro) {
      const mediaResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/media/${book.acf.copertina_libro}`);
      if (mediaResponse.ok) {
        const media = await mediaResponse.json();
        coverUrl = media.media_details?.sizes?.["cover-app"]?.source_url || media.source_url || coverUrl;
      }
    }

    return {
      id: bookId,
      title: book.title.rendered,
      subtitle: book.acf?.sottotitolo_per_sito || "No subtitle available",
      coverUrl,
    };
  } catch (error) {
    console.error("Error fetching book details:", error);
    throw error;
  }
};

const MyBooks = () => {
  const { toast } = useToast();

  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    meta: {
      onError: (error: any) => {
        console.error("Profile fetch error:", error);
        toast({
          title: "Error",
          description: "Unable to load profile. Please try logging in again.",
          variant: "destructive",
        });
      }
    }
  });

  if (profileError?.message?.includes('No active session')) {
    return <Navigate to="/auth" replace />;
  }

  const { data: bookDetails, isLoading: isLoadingBook } = useQuery({
    queryKey: ['book', profile?.book_id],
    queryFn: () => fetchBookDetails(profile?.book_id || ''),
    enabled: !!profile?.book_id,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    meta: {
      onError: (error) => {
        console.error("Book details fetch error:", error);
        toast({
          title: "Error",
          description: "Unable to load book details. Please try again later.",
          variant: "destructive",
        });
      }
    }
  });

  const isLoading = isLoadingProfile || isLoadingBook;
  const books = bookDetails ? [bookDetails] : [];

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
        {books.map((book) => (
          <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="grid grid-cols-[1fr,1.5fr] gap-4">
                <div className="relative">
                  <img
                    src={book.coverUrl}
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
                  <div className="mt-auto space-y-4">
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