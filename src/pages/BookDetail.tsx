import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BookPurchaseButtons } from "@/components/book/BookPurchaseButtons";

interface Book {
  title: string;
  subtitle: string;
  coverUrl: string;
  description?: string;
  isRegistered: boolean;
  purchaseLinks?: {
    kindle?: string;
    paperback?: string;
    hardcover?: string;
  };
}

interface WordPressBook {
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  acf: {
    sottotitolo_per_sito: string;
    copertina_libro?: string;
    descrizione_breve_libro?: string;
    link_kindle?: string;
    link_ppb?: string;
    link_copertina_rigida?: string;
  };
}

const BookDetail = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();

  // Query to check if user has access to the book (either through profile or coupons)
  const { data: hasAccess = false } = useQuery({
    queryKey: ['bookAccess', id],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Check profile table
        const { data: profile } = await supabase
          .from('profiles')
          .select('book_id')
          .single();

        if (profile?.book_id === id) return true;

        // Check user_coupons table
        const { data: coupons } = await supabase
          .from('user_coupons')
          .select('book_id')
          .eq('book_id', id);

        return coupons && coupons.length > 0;
      } catch (error) {
        console.error("Error checking book access:", error);
        return false;
      }
    }
  });

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        // Fetch book details from WordPress
        const bookResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/libri/${id}`);
        const bookData: WordPressBook = await bookResponse.json();
        
        // Fetch cover image if available
        let coverUrl = '/placeholder.svg';
        if (bookData.acf?.copertina_libro) {
          try {
            const mediaResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/media/${bookData.acf.copertina_libro}`);
            const mediaData = await mediaResponse.json();
            coverUrl = mediaData.media_details?.sizes?.["cover-app"]?.source_url || mediaData.source_url;
          } catch (error) {
            console.error("Error fetching cover image:", error);
          }
        }
        
        setBook({
          title: bookData.title.rendered,
          subtitle: bookData.acf.sottotitolo_per_sito,
          coverUrl,
          description: bookData.acf.descrizione_breve_libro,
          isRegistered: hasAccess,
          purchaseLinks: {
            kindle: bookData.acf.link_kindle,
            paperback: bookData.acf.link_ppb,
            hardcover: bookData.acf.link_copertina_rigida,
          }
        });
      } catch (error) {
        console.error("Error fetching book details:", error);
        toast({
          title: "Error",
          description: "Failed to load book details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [toast, id, hasAccess]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 w-1/2 bg-gray-200 rounded mb-8"></div>
                <div className="aspect-[3/4] max-w-sm mx-auto bg-gray-200 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Book not found</h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                {hasAccess ? (
                  <div className="mt-6">
                    <Button 
                      onClick={() => navigate(`/book/${id}/recipes`)}
                      className="w-full bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#7E69AB]"
                    >
                      View Book Recipes
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Get access to this book's exclusive content and recipes
                    </p>
                    <Button className="w-full bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#7E69AB]">
                      Purchase Access
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-6">{book.subtitle}</p>
                {hasAccess ? (
                  <>
                    {book.description && (
                      <div className="prose max-w-none mb-6">
                        <p>{book.description}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="prose max-w-none mb-6">
                      {book.description ? (
                        <p>{book.description}</p>
                      ) : (
                        <>
                          <p>Purchase this book to unlock:</p>
                          <ul>
                            <li>Exclusive recipes</li>
                            <li>Detailed instructions</li>
                            <li>Cooking tips and tricks</li>
                            <li>Meal planning suggestions</li>
                          </ul>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {book.purchaseLinks && (
              <BookPurchaseButtons
                kindleLink={book.purchaseLinks.kindle}
                paperbackLink={book.purchaseLinks.paperback}
                hardcoverLink={book.purchaseLinks.hardcover}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookDetail;
