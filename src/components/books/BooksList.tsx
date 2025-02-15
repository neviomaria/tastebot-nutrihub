import { BookCard } from "./BookCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile"; 

interface Book {
  book_id: string;
  book_title: string;
  coverUrl?: string;
}

interface BooksListProps {
  books: Book[];
  bookCovers: string[];
}

export const BooksList = ({ books, bookCovers }: BooksListProps) => {
  const isMobile = useIsMobile();
  const shouldUseCarousel = !isMobile && books.length > 2;

  if (shouldUseCarousel) {
    return (
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {books.map((book, index) => (
            <CarouselItem key={book.book_id} className="pl-2 md:pl-4 md:basis-1/2">
              <BookCard
                id={book.book_id}
                title={book.book_title}
                coverUrl={bookCovers[index] || "/placeholder.svg"}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {books.map((book, index) => (
        <BookCard
          key={book.book_id}
          id={book.book_id}
          title={book.book_title}
          coverUrl={bookCovers[index] || "/placeholder.svg"}
        />
      ))}
    </div>
  );
};
