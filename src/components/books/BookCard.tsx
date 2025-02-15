import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  id: string;
  title: string;
  coverUrl: string;
} 

export const BookCard = ({ id, title, coverUrl }: BookCardProps) => {
  const navigate = useNavigate();

  return (
    <Card key={id} className="overflow-hidden h-full">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="relative">
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover aspect-[3/4]"
            loading="lazy"
            onError={(e) => {
              console.log('Image failed to load:', coverUrl);
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
        <div className="py-4 px-4 flex flex-col flex-grow">
          <h2 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h2>
          <div className="mt-auto space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-between bg-gradient-to-r from-[#F5F5F7] to-[#FFFFFF] hover:from-[#EAEAEC] hover:to-[#F5F5F7]"
              onClick={() => navigate(`/book/${id}`)}
            >
              View Details
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              className="w-full justify-between bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#7E69AB]"
              onClick={() => navigate(`/book/${id}/recipes`)}
            >
              View Recipes
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
