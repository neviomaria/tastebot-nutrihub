import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthState } from "@/hooks/use-auth-state";
import {
  Book,
  Heart,
  Home,
  Timer,
  User,
  Ticket,
  CalendarDays,
  ShoppingBag,
  LogOut,
  Menu,
  Utensils
} from "lucide-react";
import { useState } from "react";
 
export function AppSidebar() {
  const { handleSignOut } = useAuthState();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Book, label: "My Books", path: "/my-books" },
    { icon: Ticket, label: "My Coupons", path: "/my-coupons" },
    { icon: Heart, label: "Favorite Recipes", path: "/favorite-recipes" },
    { icon: Utensils, label: "Cook with Ingredients", path: "/cook-with-ingredients" },
    { icon: CalendarDays, label: "Meal Plans", path: "/meal-plans" },
    { icon: Timer, label: "Timers", path: "/timers" },
    { icon: ShoppingBag, label: "Shopping Lists", path: "/shopping-lists" },
  ];

  const SidebarContent = () => (
    <>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.path} to={item.path} className="block" onClick={() => setIsOpen(false)}>
                {({ isActive }) => (
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text ${
                      isActive ? 'bg-sidebar-hover' : ''
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar h-16 px-4 flex items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-text">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-sidebar w-72">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-sidebar-border">
                <h1 className="text-xl font-semibold text-sidebar-text">Pybher</h1>
              </div>
              <ScrollArea className="flex-1">
                <SidebarContent />
              </ScrollArea>
              <div className="p-4 border-t border-sidebar-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="ml-4">
          <h1 className="text-xl font-semibold text-sidebar-text">Pybher</h1>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex lg:flex-col border-r bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-semibold text-sidebar-text">Pybher</h1>
        </div>
        <ScrollArea className="flex-1">
          <SidebarContent />
        </ScrollArea>
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-text hover:bg-sidebar-hover active:bg-sidebar-active"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </Sidebar>

      {/* Mobile Content Spacing */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
