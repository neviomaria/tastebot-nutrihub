import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface Book {
  title: string;
  subtitle: string;
  coverUrl: string;
}

interface WordPressMedia {
  guid: {
    rendered: string;
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
          // Fetch cover image from WordPress
          try {
            const response = await fetch('https://brainscapebooks.com/wp-json/wp/v2/media/2571');
            const mediaData: WordPressMedia = await response.json();
            
            setBooks([
              {
                title: profile.book_title || "Your Book",
                subtitle: "Gluten Free Recipe Book", // We can make this dynamic later if needed
                coverUrl: mediaData.guid.rendered,
              },
            ]);
          } catch (error) {
            console.error("Error fetching book cover:", error);
            toast({
              title: "Error",
              description: "Failed to load book cover image",
              variant: "destructive",
            });
            // Still show the book but with placeholder image
            setBooks([
              {
                title: profile.book_title || "Your Book",
                subtitle: "Gluten Free Recipe Book",
                coverUrl: "/placeholder.svg",
              },
            ]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="aspect-[3/4] w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
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
              <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
              <p className="text-gray-600">{book.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyBooks;