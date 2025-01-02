import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Book, LayoutDashboard, Ticket, LogOut } from "lucide-react";
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

  const baseMenuItems: MenuItem[] = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Profile", icon: User, path: "/profile" },
    { title: "My Books", icon: Book, path: "/my-books" },
    { title: "My Coupons", icon: Ticket, path: "/my-coupons" },
  ];

  const [menuItems] = useState<MenuItem[]>(baseMenuItems);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("book_id, book_title")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        if (profile?.book_id && profile?.book_title) {
          setUserBooks([{ 
            book_id: profile.book_id,
            book_title: profile.book_title
          }]);
        } else {
          setUserBooks([]);
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user profile",
        });
      }
    };

    fetchUserProfile();
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

  const MenuLink = ({ item }: { item: MenuItem }) => (
    <Link
      to={item.path}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
        location.pathname === item.path
          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
          : ""
      }`}
    >
      <item.icon className="h-4 w-4" />
      {item.title}
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4 bg-white">
      <div className="flex h-[60px] items-center border-b px-6 bg-white">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">FlavorFit</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <div key={item.title}>
                <MenuLink item={item} />
                {item.title === "My Books" && userBooks.length > 0 && (
                  <div className="ml-6 mt-2 space-y-1">
                    {userBooks.map((book) => (
                      <div key={book.book_id} className="space-y-1">
                        <Link
                          to={`/book/${book.book_id}`}
                          className="block rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                        >
                          {book.book_title}
                        </Link>
                        <Link
                          to={`/book/${book.book_id}/recipes`}
                          className="block rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ml-4"
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
      <div className="border-t p-3 bg-white">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex">
      <div className="hidden border-r bg-white lg:block w-[300px]">
        <SidebarContent />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed left-4 top-4 z-40"
            size="icon"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 bg-white">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <AppHeader />
        {children}
      </main>
    </div>
  );
}