import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Book {
  title: string;
  subtitle: string;
  coverUrl: string;
  content?: string;
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
  };
}

const BookDetail = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { id } = useParams();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("book_id")
          .single();

        if (profile?.book_id) {
          try {
            // Fetch book details from WordPress
            const bookResponse = await fetch('https://brainscapebooks.com/wp-json/wp/v2/libri/1896');
            const bookData: WordPressBook = await bookResponse.json();
            
            // Fetch cover image from WordPress
            const mediaResponse = await fetch('https://brainscapebooks.com/wp-json/wp/v2/media/2571');
            const mediaData = await mediaResponse.json();
            
            setBook({
              title: bookData.title.rendered,
              subtitle: bookData.acf.sottotitolo_per_sito,
              coverUrl: mediaData.guid.rendered,
              content: bookData.content.rendered,
            });
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
        console.error("Error fetching book:", error);
        toast({
          title: "Error",
          description: "Failed to load book details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [toast, id]);

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
          <Link to="/my-books">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Books
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/my-books">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Books
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
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-6">{book.subtitle}</p>
                {book.content && (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: book.content }}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookDetail;