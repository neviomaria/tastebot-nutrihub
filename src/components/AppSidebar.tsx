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
    <Sidebar className="border-r bg-sidebar">
      <ScrollArea className="h-full">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <NavLink to="/" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </NavLink>
              <NavLink to="/profile" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </NavLink>
              <NavLink to="/my-books" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
                >
                  <Book className="h-4 w-4" />
                  My Books
                </Button>
              </NavLink>
              <NavLink to="/my-coupons" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
                >
                  <Ticket className="h-4 w-4" />
                  My Coupons
                </Button>
              </NavLink>
              <NavLink to="/favorite-recipes" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
                >
                  <Heart className="h-4 w-4" />
                  Favorite Recipes
                </Button>
              </NavLink>
              <NavLink to="/meal-plans" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
                >
                  <CalendarDays className="h-4 w-4" />
                  Meal Plans
                </Button>
              </NavLink>
              <NavLink to="/timers" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
                >
                  <Timer className="h-4 w-4" />
                  Timers
                </Button>
              </NavLink>
              <NavLink to="/shopping-lists" className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Shopping Lists
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Sidebar>
  );
}