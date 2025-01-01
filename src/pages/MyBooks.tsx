import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Book {
  title: string;
  subtitle: string;
  coverUrl: string;
}

const MyBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("book_title, book_id")
          .single();

        if (profile?.book_id) {
          // For now we just show the one book the user has access to
          setBooks([
            {
              title: profile.book_title || "Your Book",
              subtitle: "", // We'll add this later when we have the data
              coverUrl: "/placeholder.svg", // We'll add real cover later
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <h1 className="text-2xl font-bold mb-6">My Books</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="aspect-[3/4] relative mb-4">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
              {book.subtitle && (
                <p className="text-sm text-muted-foreground">{book.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyBooks;