import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Book, LayoutDashboard, Ticket, LogOut, Heart, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "./AppHeader";

interface MenuItem {
  title: string;
  icon: any;
  path: string;
}

interface UserBook {
  book_id: string;
  book_title: string;
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
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

        console.log("All user books:", allBooks);
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

  const MenuLink = ({ item }: { item: MenuItem }) => (
    <Link
      to={item.path}
      onClick={handleMenuClick}
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
        location.pathname === item.path
          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
          : ""
      }`}
    >
      <item.icon className="h-4 w-4 text-primary" />
      {item.title}
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-[60px] items-center px-4 border-b">
        <Link 
          to="/" 
          className="flex items-center gap-2 font-semibold" 
          onClick={handleMenuClick}
        >
          <span className="text-xl">Pybher</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto px-2">
        <div className="space-y-1 py-2">
          <div className="flex flex-col gap-0.5">
            {menuItems.map((item) => (
              <div key={item.title}>
                <MenuLink item={item} />
                {item.title === "My Books" && userBooks.length > 0 && (
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    {userBooks.map((book) => (
                      <div key={book.book_id} className="space-y-0.5">
                        <Link
                          to={`/book/${book.book_id}`}
                          onClick={handleMenuClick}
                          className="block rounded-lg px-2 py-1 text-sm text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                        >
                          {book.book_title}
                        </Link>
                        <Link
                          to={`/book/${book.book_id}/recipes`}
                          onClick={handleMenuClick}
                          className="block rounded-lg px-2 py-1 text-sm text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ml-2"
                        >
                          Book Recipes
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="sticky bottom-0 border-t bg-white p-2 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 hover:text-gray-900"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4 text-primary" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex">
      <div className="hidden fixed top-0 left-0 h-screen border-r bg-white lg:block w-[300px]">
        <SidebarContent />
      </div>

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
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 lg:ml-[300px]">
        <AppHeader />
        {children}
      </main>
    </div>
  );
}