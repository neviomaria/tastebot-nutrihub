import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Book {
  id: number;
  title: { rendered: string };
  acf: {
    copertina_libro?: string;
    sottotitolo_per_sito?: string;
    cookbook?: string;
  };
}

export function AvailableBooksWidget() {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('book_id')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['available-books'],
    queryFn: async () => {
      const response = await fetch('https://brainscapebooks.com/wp-json/wp/v2/libri');
      if (!response.ok) throw new Error('Failed to fetch books');
      const allBooks: Book[] = await response.json();
      
      // Filter cookbooks and exclude user's owned book
      return allBooks.filter(book => 
        book.acf?.cookbook === 'Yes' && 
        book.id.toString() !== profile?.book_id
      );
    },
    enabled: !!profile,
  });

  const { data: bookCovers = {} } = useQuery({
    queryKey: ['book-covers', books],
    queryFn: async () => {
      const covers: Record<number, string> = {};
      
      for (const book of books) {
        if (book.acf?.copertina_libro) {
          try {
            const mediaResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/media/${book.acf.copertina_libro}`);
            if (mediaResponse.ok) {
              const media = await mediaResponse.json();
              covers[book.id] = media.media_details?.sizes?.["cover-app"]?.source_url || media.source_url;
            }
          } catch (error) {
            console.error(`Failed to fetch cover for book ${book.id}:`, error);
            covers[book.id] = "/placeholder.svg";
          }
        } else {
          covers[book.id] = "/placeholder.svg";
        }
      }
      
      return covers;
    },
    enabled: books.length > 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Available Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!books.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Discover More Culinary Adventures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {books.map((book) => (
              <CarouselItem key={book.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,1.5fr] gap-4">
                      <div className="relative">
                        <img
                          src={bookCovers[book.id] || "/placeholder.svg"}
                          alt={book.title.rendered}
                          className="w-full h-full object-cover aspect-[3/4]"
                          loading="lazy"
                          onError={(e) => {
                            console.log('Image failed to load:', bookCovers[book.id]);
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="py-4 px-4 md:pr-4 md:pl-0 flex flex-col">
                        <h2 className="text-lg font-semibold mb-4 line-clamp-2">{book.title.rendered}</h2>
                        {book.acf?.sottotitolo_per_sito && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {book.acf.sottotitolo_per_sito}
                          </p>
                        )}
                        <div className="mt-auto">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(`/book/${book.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
}