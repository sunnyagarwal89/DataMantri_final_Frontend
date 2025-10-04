import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  Home,
  Upload,
  Database,
  Boxes,
  Palette,
  PieChart,
  LayoutDashboard,
  LogOut,
  Calendar,
  BarChart,
  Users,
  Shield,
  Server,
  Sparkles
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  { title: "Homepage", url: "/dashboard", icon: Home },
  { title: "Data Management", url: "/database-management", icon: Server },
  { title: "All Dashboards", url: "/all-dashboards", icon: LayoutDashboard },
  { title: "Dashboard Builder", url: "/dashboard-builder", icon: PieChart },
  { title: "Themes & Charts", url: "/theme-library", icon: Palette },
  { title: "Scheduler", url: "/scheduler", icon: Calendar },
  { title: "Access Control", url: "/access-management", icon: Shield, adminOnly: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    logout();
  };

  const isCollapsed = state === "collapsed";

  // Filter navigation items based on admin status
  const filteredNavigationItems = navigationItems.filter(
    item => !item.adminOnly || user?.is_admin
  );

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            {user?.organization_logo_url ? (
              <img src={user.organization_logo_url} alt={`${user.organization_name} Logo`} className="h-8 w-8 object-contain" />
            ) : (
              <BarChart3 className="h-6 w-6 text-primary" />
            )}
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sidebar-foreground">{user?.organization_name || 'DataMantri'}</span>
                {user?.organization_name && <span className="text-xs text-muted-foreground">Powered by DataMantri</span>}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground">
              NAVIGATION
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigationItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={`${
                            active 
                              ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' 
                              : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          }`}
                        >
                          <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className="h-5 w-5" />
                            {!isCollapsed && <span className="flex-1">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter>
        <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              {user?.is_admin && (
                <Badge variant="secondary" className="w-full justify-center">
                  Admin
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer">
                    <span className="text-sm font-semibold text-primary">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
