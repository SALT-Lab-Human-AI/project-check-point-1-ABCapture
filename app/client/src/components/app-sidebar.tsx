import { Home, Users, Clock, Settings, LogOut, Mic, LayoutDashboard, UserCog, FileText, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoUrl from "@assets/ABCapture logo.png";

const teacherMenuItems = [
  {
    title: "Record Incident",
    url: "/record-incident",
    icon: Mic,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Incident History",
    url: "/history",
    icon: Clock,
  },
  {
    title: "My Students",
    url: "/students",
    icon: Users,
  },
];

const administratorMenuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "All Teachers",
    url: "/admin/teachers",
    icon: UserCog,
  },
  {
    title: "Recent Incidents",
    url: "/admin/incidents",
    icon: FileText,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const menuItems = user?.role === "administrator" ? administratorMenuItems : teacherMenuItems;

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch("/api/auth/logout", { method: "POST" });
      
      // Clear auth cache to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.clear();
      
      // Force a full page reload to login page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="p-4">
          <img src={logoUrl} alt="ABCapture Logo" className="w-full h-auto bg-transparent" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url} 
                    data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}
                    className="data-[active=true]:bg-blue-500 data-[active=true]:text-white hover:bg-blue-100 hover:text-blue-700 transition-colors relative"
                  >
                    <Link href={item.url} className="group">
                      {location === item.url && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 border-l-2 border-dashed border-blue-500" />
                      )}
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/help">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
