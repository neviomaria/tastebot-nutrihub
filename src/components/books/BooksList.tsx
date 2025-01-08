import { BookCard } from "./BookCard";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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