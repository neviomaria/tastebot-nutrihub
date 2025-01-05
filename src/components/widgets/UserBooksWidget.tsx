import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ChevronRight } from "lucide-react";

export function UserBooksWidget() {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return null;
      }

      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('book_id, book_title')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      console.log('Profile data:', data);
      return data;
    }
  });

  const { data: bookCover } = useQuery({
    queryKey: ['bookCover', profile?.book_id],
    queryFn: async () => {
      const bookResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/libri/${profile?.book_id}`);
      if (!bookResponse.ok) throw new Error("Failed to fetch book details");
      const book = await bookResponse.json();

      let coverUrl = "/placeholder.svg";
      if (book.acf?.copertina_libro) {
        const mediaResponse = await fetch(`https://brainscapebooks.com/wp-json/wp/v2/media/${book.acf.copertina_libro}`);
        if (mediaResponse.ok) {
          const media = await mediaResponse.json();
          coverUrl = media.media_details?.sizes?.["cover-app"]?.source_url || media.source_url || coverUrl;
        }
      }
      return coverUrl;
    },
    enabled: !!profile?.book_id
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Books
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profile?.book_id && profile?.book_title ? (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-[1fr,1.5fr] gap-4">
                <div className="relative">
                  <img
                    src={bookCover || "/placeholder.svg"}
                    alt={profile.book_title}
                    className="w-full h-full object-cover aspect-[3/4]"
                    loading="lazy"
                    onError={(e) => {
                      console.log('Image failed to load:', bookCover);
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="py-4 px-4 md:pr-4 md:pl-0 flex flex-col">
                  <h2 className="text-lg font-semibold mb-2 line-clamp-2">{profile.book_title}</h2>
                  <div className="mt-auto space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-between bg-gradient-to-r from-[#F5F5F7] to-[#FFFFFF] hover:from-[#EAEAEC] hover:to-[#F5F5F7]"
                      onClick={() => navigate(`/book/${profile.book_id}`)}
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      className="w-full justify-between bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#7E69AB]"
                      onClick={() => navigate(`/book/${profile.book_id}/recipes`)}
                    >
                      View Recipes
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground">No books available</p>
        )}
      </CardContent>
    </Card>
  );
}