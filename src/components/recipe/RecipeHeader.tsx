import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecipeHeaderProps {
  onPrevious: () => void;
  onNext: () => void;
  mealType?: string;
}

export function RecipeHeader({ onPrevious, onNext, mealType }: RecipeHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            className="rounded-full bg-white"
          >
            <ArrowLeftCircle className="h-4 w-4" />
            <span className="sr-only">Previous recipe</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            className="rounded-full bg-white"
          >
            <ArrowRightCircle className="h-4 w-4" />
            <span className="sr-only">Next recipe</span>
          </Button>
        </div>
      </div>
      {mealType && (
        <div className="text-muted-foreground text-sm text-center">
          {mealType}
        </div>
      )}
    </div>
  );
}