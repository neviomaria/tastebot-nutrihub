import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface BookAccess {
  book_id: string;
  book_title: string;
  coupon_code: string;
}

interface CouponListProps {
  bookAccess: BookAccess[];
  onRemoveCoupon: (couponCode: string) => void;
}

export const CouponList = ({ bookAccess, onRemoveCoupon }: CouponListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Active Coupons</h3>
      {bookAccess.length === 0 ? (
        <p className="text-muted-foreground">No active coupons</p>
      ) : (
        <div className="space-y-4">
          {bookAccess.map((access) => (
            <div
              key={access.book_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h4 className="font-medium">{access.book_title}</h4>
                <p className="text-sm text-muted-foreground">
                  Coupon: {access.coupon_code}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveCoupon(access.coupon_code)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};