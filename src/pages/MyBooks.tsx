import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface Book {
  title: string;
  subtitle: string;
  coverUrl: string;
  id: string;
}

interface WordPressBook {
  title: {
    rendered: string;
  };
  acf: {
    sottotitolo_per_sito: string;
  };
}

const fetchUserProfile = async () => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("book_id, book_title")
    .single();

  if (error) throw error;
  return profile;
};

const fetchBookDetails = async (bookId: string) => {
  const bookResponse = await fetch('https://brainscapebooks.com/wp-json/wp/v2/libri/1896');
  const bookData: WordPressBook = await bookResponse.json();
  
  const mediaResponse = await fetch('https://brainscapebooks.com/wp-json/wp/v2/media/2571');
  const mediaData = await mediaResponse.json();
  
  return {
    id: bookId,
    title: bookData.title.rendered,
    subtitle: bookData.acf.sottotitolo_per_sito,
    coverUrl: mediaData.guid.rendered,
  };
};

const MyBooks = () => {
  const { toast } = useToast();

  // Query for user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Query for book details
  const { data: bookDetails, isLoading: isLoadingBook } = useQuery({
    queryKey: ['book', profile?.book_id],
    queryFn: () => fetchBookDetails(profile?.book_id || ''),
    enabled: !!profile?.book_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });

  const isLoading = isLoadingProfile || isLoadingBook;
  const books = bookDetails ? [bookDetails] : [];

  if (isLoading) {
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
        {books.map((book) => (
          <Link to={`/book/${book.id}`} key={book.id}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-[3/4] relative mb-4">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
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