import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

export function UserBooksWidget() {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('book_id, book_title')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Books
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profile?.book_title ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{profile.book_title}</h3>
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/book/${profile.book_id}`)}
              >
                View Book
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No books available</p>
        )}
      </CardContent>
    </Card>
  );
}