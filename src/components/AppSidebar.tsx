import { Home, ChefHat, Activity, Users, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { title: "Home", icon: Home, path: "/" },
  { title: "Recipes", icon: ChefHat, path: "/recipes" },
  { title: "Analytics", icon: Activity, path: "/analytics" },
  { title: "Community", icon: Users, path: "/community" },
  { title: "Profile", icon: Users, path: "/complete-profile" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="flex min-h-screen w-full bg-secondary">
      <aside
        className={cn(
          "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar-bg transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed && (
            <span className="text-xl font-semibold text-primary">FlavorFit</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-icon hover:bg-sidebar-hover"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          <TooltipProvider delayDuration={0}>
            {menuItems.map((item) => (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sidebar-text hover:bg-sidebar-hover hover:text-primary",
                      !isCollapsed && "px-4"
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && (
                      <span className="ml-3">{item.title}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        {/* Logout */}
        <div className="p-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-text hover:bg-red-50 hover:text-red-600",
                    !isCollapsed && "px-4"
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-3">Logout</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  Logout
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}