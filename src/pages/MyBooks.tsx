import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Book {
  title: string;
  subtitle: string;
  coverUrl: string;
}

interface WordPressBook {
  title: {
    rendered: string;
  };
  acf: {
    sottotitolo_per_sito: string;
  };
}

const MyBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("book_id, book_title")
          .single();

        if (profile?.book_id) {
          try {
            // Fetch book details from WordPress
            const bookResponse = await fetch('https://brainscapebooks.com/wp-json/wp/v2/libri/1896');
            const bookData: WordPressBook = await bookResponse.json();
            
            // Fetch cover image from WordPress
            const mediaResponse = await fetch('https://brainscapebooks.com/wp-json/wp/v2/media/2571');
            const mediaData = await mediaResponse.json();
            
            setBooks([
              {
                title: bookData.title.rendered,
                subtitle: bookData.acf.sottotitolo_per_sito,
                coverUrl: mediaData.guid.rendered,
              },
            ]);
          } catch (error) {
            console.error("Error fetching book details:", error);
            toast({
              title: "Error",
              description: "Failed to load book details",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        toast({
          title: "Error",
          description: "Failed to load your books",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [toast]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Books</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {books.map((book, index) => (
          <Link to={`/book/${index}`} key={index}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-[3/4] relative mb-4">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg"
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