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
    copertina_libro?: {
      url?: string;
      sizes?: {
        'cover-app'?: {
          source_url?: string;
        };
        medium?: {
          source_url?: string;
        };
      };
    };
    sottotitolo_per_sito?: string;
    cookbook?: string;
  };
}

export function AvailableBooksWidget() {
  console.log("[AvailableBooksWidget] Starting render");
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log("[AvailableBooksWidget] Fetching profile");
      const { data, error } = await supabase
        .from('profiles')
        .select('book_id')
        .single();
      
      if (error) throw error;
      console.log("[AvailableBooksWidget] Profile data:", data);
      return data;
    }
  });

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['available-books'],
    queryFn: async () => {
      console.log("[AvailableBooksWidget] Fetching available books");
      const response = await fetch('https://brainscapebooks.com/wp-json/wp/v2/libri');
      if (!response.ok) throw new Error('Failed to fetch books');
      const allBooks: Book[] = await response.json();
      console.log("[AvailableBooksWidget] All books:", allBooks);
      
      const filteredBooks = allBooks.filter(book => 
        book.acf?.cookbook === 'Yes' && 
        book.id.toString() !== profile?.book_id
      );
      console.log("[AvailableBooksWidget] Filtered books:", filteredBooks);
      return filteredBooks;
    },
    enabled: !!profile,
  });

  const getBookCoverUrl = async (book: Book) => {
    console.log("[AvailableBooksWidget] Getting cover for book:", book.title.rendered);
    
    if (!book.acf?.copertina_libro) {
      console.log("[AvailableBooksWidget] No cover found, using placeholder");
      return "/placeholder.svg";
    }

    try {
      const mediaResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/media/${book.acf.copertina_libro}`);
      if (!mediaResponse.ok) {
        console.error('Failed to fetch media details:', mediaResponse.statusText);
        return "/placeholder.svg";
      }
      const media = await mediaResponse.json();
      
      // Try to get the cover-app size first, then medium size, then fall back to full URL
      const coverUrl = 
        media.media_details?.sizes?.['cover-app']?.source_url ||
        media.media_details?.sizes?.['medium']?.source_url ||
        media.source_url;

      console.log("[AvailableBooksWidget] Using cover URL:", coverUrl);
      return coverUrl || "/placeholder.svg";
    } catch (error) {
      console.error('Error fetching book cover:', error);
      return "/placeholder.svg";
    }
  };

  const { data: bookCovers = {}, isLoading: isLoadingCovers } = useQuery({
    queryKey: ['book-covers', books.map(book => book.id)],
    queryFn: async () => {
      console.log("[AvailableBooksWidget] Fetching book covers");
      const covers: Record<number, string> = {};
      
      await Promise.all(books.map(async (book) => {
        covers[book.id] = await getBookCoverUrl(book);
      }));
      
      console.log("[AvailableBooksWidget] Book covers:", covers);
      return covers;
    },
    enabled: books.length > 0,
  });

  if (isLoading || isLoadingCovers) {
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

  console.log("[AvailableBooksWidget] Rendering component with books:", books.length);
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
                            console.log('[AvailableBooksWidget] Image failed to load:', bookCovers[book.id]);
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
