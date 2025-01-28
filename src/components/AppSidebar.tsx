import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Book, LayoutDashboard, Ticket, LogOut, Heart, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

export function AppSidebar() {
  const { toast } = useToast();
  const location = useLocation();
  const [openMobile, setOpenMobile] = useState(false);

  const menuItems: MenuItem[] = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Profile", icon: User, path: "/profile" },
    { title: "My Books", icon: Book, path: "/my-books" },
    { title: "My Coupons", icon: Ticket, path: "/my-coupons" },
    { title: "Favorite Recipes", icon: Heart, path: "/favorite-recipes" },
    { title: "Meal Plans", icon: Calendar, path: "/meal-plans" },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
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
      <Sidebar className="hidden lg:flex bg-purple-900">
        <SidebarHeader className="h-[60px] flex items-center px-6 border-b bg-purple-800">
          <Link to="/" className="flex items-center gap-2 font-semibold text-white">
            <span className="text-xl">Pybher</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="bg-purple-900">
          <ScrollArea className="flex-1 px-4 bg-purple-900">
            <SidebarMenu className="pt-4">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 text-white hover:bg-purple-700 data-[active=true]:bg-purple-700 data-[active=true]:font-bold rounded-md px-3 py-2"
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
          <div className="sticky bottom-0 border-t p-4 mt-auto bg-purple-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-purple-700"
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
            className="lg:hidden fixed left-4 top-4 z-[60] bg-purple-900 text-white"
            size="icon"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 bg-purple-900">
          <div className="flex h-full flex-col">
            <div className="h-[60px] flex items-center px-6 border-b border-purple-800">
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold text-white"
                onClick={handleMenuClick}
              >
                <span className="text-xl">Pybher</span>
              </Link>
            </div>
            <ScrollArea className="flex-1 px-4 py-6 bg-purple-900">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title} className="mb-2">
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                    >
                      <Link
                        to={item.path}
                        className="flex items-center gap-3 text-white hover:bg-purple-700 data-[active=true]:bg-purple-700 data-[active=true]:font-bold rounded-md px-4 py-3 text-lg"
                        onClick={handleMenuClick}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
            <div className="border-t border-purple-800 p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-purple-700 py-3 text-lg"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}