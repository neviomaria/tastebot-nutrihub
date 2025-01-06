import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface BookPurchaseButtonsProps {
  kindleLink?: string;
  paperbackLink?: string;
  hardcoverLink?: string;
}

export const BookPurchaseButtons = ({
  kindleLink,
  paperbackLink,
  hardcoverLink,
}: BookPurchaseButtonsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {kindleLink && (
        <a href={kindleLink} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full" variant="outline">
            <ShoppingCart className="mr-2" />
            Buy Kindle
          </Button>
        </a>
      )}
      {paperbackLink && (
        <a href={paperbackLink} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full" variant="outline">
            <ShoppingCart className="mr-2" />
            Buy Paperback
          </Button>
        </a>
      )}
      {hardcoverLink && (
        <a href={hardcoverLink} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full" variant="outline">
            <ShoppingCart className="mr-2" />
            Buy Hardcover
          </Button>
        </a>
      )}
    </div>
  );
};