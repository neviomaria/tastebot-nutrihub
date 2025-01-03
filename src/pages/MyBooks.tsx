import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

interface Book {
  title: string;
  subtitle: string;
  coverUrl: string;
  id: string;
}

interface WordPressBook {
  title: {
    rendered: string;
  };
  acf: {
    sottotitolo_per_sito: string;
  };
}

// Temporary mock data until WordPress API is properly configured
const MOCK_BOOK_DATA = {
  title: "Il Metodo BrainFood",
  subtitle: "Nutri il tuo cervello",
  coverUrl: "https://picsum.photos/400/600", // Temporary placeholder image
};

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
    // Recupera i dettagli del libro
    const bookResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/libri/${bookId}`);
    if (!bookResponse.ok) throw new Error("Failed to fetch book details");
    const book = await bookResponse.json();

    // Recupera i dettagli della copertina
    let coverUrl = "/placeholder.svg"; // Immagine predefinita
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

  // Query for user profile
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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

  // If there's an authentication error, redirect to login
  if (profileError?.message?.includes('No active session')) {
    return <Navigate to="/auth" replace />;
  }

  // Query for book details
  const { data: bookDetails, isLoading: isLoadingBook } = useQuery({
    queryKey: ['book', profile?.book_id],
    queryFn: () => fetchBookDetails(profile?.book_id || ''),
    enabled: !!profile?.book_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
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
        <h1 className="text-2xl font-bold mb-6">My Books</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="aspect-[3/4] w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Books</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {books.map((book) => (
          <Link to={`/book/${book.id}`} key={book.id}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-[3/4] relative mb-4">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <h2 className="text-sm font-semibold mb-1 line-clamp-2">{book.title}</h2>
                <p className="text-xs text-gray-600 line-clamp-2">{book.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyBooks;