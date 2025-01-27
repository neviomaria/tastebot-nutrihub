import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Book, LayoutDashboard, Ticket, LogOut, Heart, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "./AppHeader";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  icon: any;
  path: string;
}

interface UserBook {
  book_id: string;
  book_title: string;
}

export function AppSidebar() {
  const { toast } = useToast();
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const location = useLocation();
  const [openMobile, setOpenMobile] = useState(false);

  const baseMenuItems: MenuItem[] = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Profile", icon: User, path: "/profile" },
    { title: "My Books", icon: Book, path: "/my-books" },
    { title: "My Coupons", icon: Ticket, path: "/my-coupons" },
    { title: "Favorite Recipes", icon: Heart, path: "/favorite-recipes" },
    { title: "Meal Plans", icon: Calendar, path: "/meal-plans" },
  ];

  const [menuItems] = useState<MenuItem[]>(baseMenuItems);

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        // Fetch book from profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("book_id, book_title")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        // Fetch books from user_coupons
        const { data: userCoupons, error: couponsError } = await supabase
          .from("user_coupons")
          .select("book_id, book_title")
          .eq("user_id", user.id);

        if (couponsError) {
          console.error("Error fetching user coupons:", couponsError);
          throw couponsError;
        }

        // Combine books from both sources, avoiding duplicates
        let allBooks: UserBook[] = [];
        
        // Add profile book if it exists
        if (profile?.book_id && profile?.book_title) {
          allBooks.push({
            book_id: profile.book_id,
            book_title: profile.book_title
          });
        }

        // Add books from user_coupons, avoiding duplicates
        if (userCoupons) {
          userCoupons.forEach(coupon => {
            if (!allBooks.some(book => book.book_id === coupon.book_id)) {
              allBooks.push({
                book_id: coupon.book_id,
                book_title: coupon.book_title
              });
            }
          });
        }

        setUserBooks(allBooks);
      } catch (error) {
        console.error("Error in fetchUserBooks:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user books",
        });
      }
    };

    fetchUserBooks();
  }, [toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };

  const handleMenuClick = () => {
    setOpenMobile(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex">
        <SidebarHeader className="h-[60px] flex items-center px-6 border-b">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">Pybher</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="flex-1 px-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link
                      to={item.path}
                      className="flex items-center gap-2"
                      onClick={handleMenuClick}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.title === "My Books" && userBooks.length > 0 && (
                    <div className="mt-2 space-y-2 pl-6">
                      {userBooks.map((book) => (
                        <div key={book.book_id} className="space-y-1">
                          <Link
                            to={`/book/${book.book_id}`}
                            onClick={handleMenuClick}
                            className="block text-sm text-muted-foreground hover:text-foreground"
                          >
                            {book.book_title}
                          </Link>
                          <Link
                            to={`/book/${book.book_id}/recipes`}
                            onClick={handleMenuClick}
                            className="block text-sm text-muted-foreground hover:text-foreground"
                          >
                            Book Recipes
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
          <div className="sticky bottom-0 border-t p-4 mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>

      {/* Mobile Sidebar */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed left-4 top-4 z-[60]"
            size="icon"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <div className="flex h-full flex-col">
            <div className="h-[60px] flex items-center px-6 border-b">
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold"
                onClick={handleMenuClick}
              >
                <span className="text-xl">Pybher</span>
              </Link>
            </div>
            <ScrollArea className="flex-1 px-4">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                    >
                      <Link
                        to={item.path}
                        className="flex items-center gap-2"
                        onClick={handleMenuClick}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}