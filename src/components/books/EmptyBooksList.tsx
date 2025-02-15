import { BookOpen } from "lucide-react";

export const EmptyBooksList = () => {
  return (
    <div className="text-center py-8">
      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">No books available</p>
    </div> 
  );
};
