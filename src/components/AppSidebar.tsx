import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Book, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  icon: any;
  path: string;
}

export function AppSidebar({ className, children }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  const baseMenuItems: MenuItem[] = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Profile", icon: User, path: "/profile" },
    { title: "My Books", icon: Book, path: "/my-books" },
  ];

  const [menuItems, setMenuItems] = useState<MenuItem[]>(baseMenuItems);
  const [userBooks, setUserBooks] = useState<{ book_id: string; book_title: string }[]>([]);

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("coupon_code, book_id, book_title")
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        // Set user books if book_id and book_title exist
        if (profile?.book_id && profile?.book_title) {
          setUserBooks([{ 
            book_id: profile.book_id,
            book_title: profile.book_title
          }]);
        } else {
          setUserBooks([]);
        }
      } catch (error) {
        console.error("Error fetching user books:", error);
        toast({
          title: "Error",
          description: "Failed to load your books",
          variant: "destructive",
        });
      }
    };

    fetchUserBooks();
  }, [toast]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for larger screens */}
      <div className="hidden lg:flex">
        <div className={cn("pb-12 w-64", className)}>
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <div key={item.title}>
                    <Link to={item.path}>
                      <Button
                        variant={location.pathname === item.path ? "secondary" : "ghost"}
                        className="w-full justify-start"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </Button>
                    </Link>
                    {/* Display books list under My Books */}
                    {item.title === "My Books" && userBooks.length > 0 && (
                      <div className="ml-6 mt-2 space-y-1">
                        {userBooks.map((book) => (
                          <Link key={book.book_id} to={`/book/${book.book_id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-sm"
                            >
                              {book.book_title}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="lg:hidden" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <ScrollArea className="h-full px-3 py-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.title}>
                  <Link to={item.path} onClick={() => setOpen(false)}>
                    <Button
                      variant={location.pathname === item.path ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                  {/* Display books list under My Books in mobile view */}
                  {item.title === "My Books" && userBooks.length > 0 && (
                    <div className="ml-6 mt-2 space-y-1">
                      {userBooks.map((book) => (
                        <Link 
                          key={book.book_id} 
                          to={`/book/${book.book_id}`}
                          onClick={() => setOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm"
                          >
                            {book.book_title}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={async () => {
                  await handleLogout();
                  setOpen(false);
                }}
              >
                Sign Out
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}