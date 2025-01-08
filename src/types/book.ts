export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  coverUrl?: string;
}

export interface UserBook {
  book_id: string;
  book_title: string;
}