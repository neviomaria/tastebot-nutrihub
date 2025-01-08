import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BookRecipesHeaderProps {
  id: string;
}

export function BookRecipesHeader({ id }: BookRecipesHeaderProps) {
  return (
    <>
      <Link to={`/book/${id}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Book
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">Book Recipes</h1>
    </>
  );
}