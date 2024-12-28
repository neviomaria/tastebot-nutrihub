import { Home, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const menuItems = [
  { title: "Home", icon: Home, path: "/" },
  { title: "Profile", icon: User, path: "/profile" },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-white via-purple-50 to-blue-50">
        <Sidebar className="border-r border-purple-100/50 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-purple-100">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-700">John Doe</span>
            </div>
            <SidebarTrigger>
              {() => <ChevronLeft className="h-4 w-4 text-gray-500" />}
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    tooltip={item.title}
                    className="hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-purple-100/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}