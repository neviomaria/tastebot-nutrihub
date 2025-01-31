import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/ui/sidebar";
import {
  Book,
  Heart,
  Home,
  Timer,
  User,
  Ticket,
  CalendarDays,
  ShoppingBag
} from "lucide-react";

export function AppSidebar() {
  return (
    <Sidebar className="border-r">
      <ScrollArea className="h-full">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <NavLink to="/" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </NavLink>
              <NavLink to="/profile" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <User className="h-4 w-4" />
                  Profilo
                </Button>
              </NavLink>
              <NavLink to="/my-books" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <Book className="h-4 w-4" />
                  I miei libri
                </Button>
              </NavLink>
              <NavLink to="/my-coupons" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <Ticket className="h-4 w-4" />
                  I miei coupon
                </Button>
              </NavLink>
              <NavLink to="/favorite-recipes" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Ricette preferite
                </Button>
              </NavLink>
              <NavLink to="/meal-plans" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  Piani pasto
                </Button>
              </NavLink>
              <NavLink to="/timers" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <Timer className="h-4 w-4" />
                  Timer
                </Button>
              </NavLink>
              <NavLink to="/shopping-lists" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Liste della spesa
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Sidebar>
  );
}