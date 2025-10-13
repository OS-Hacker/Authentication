// app-sidebar.jsx
import {
  Home,
  Users,
  Package,
  PackagePlus,
  Search,
  Settings,
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
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard/overview",
    icon: Home,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Package,
    submenu: [
      {
        title: "All Products",
        url: "/dashboard/products/all",
        icon: Search,
      },
      {
        title: "Create Product",
        url: "/dashboard/products/create",
        icon: PackagePlus,
      },
    ],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url) => {
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  const isSubmenuActive = (submenuItems) => {
    return submenuItems.some((item) => location.pathname === item.url);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <span className="text-lg font-bold text-primary-foreground">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ALPHA</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const active = hasSubmenu
                  ? isSubmenuActive(item.submenu)
                  : isActive(item.url);

                return (
                  <div key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild={!hasSubmenu}
                        isActive={active}
                        className={cn(
                          "mx-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                          active && "bg-accent text-accent-foreground"
                        )}
                      >
                        {hasSubmenu ? (
                          <div className="flex items-center gap-3 px-3 py-2 cursor-default">
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium flex-1">
                              {item.title}
                            </span>
                          </div>
                        ) : (
                          <Link
                            to={item.url}
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Submenu Items */}
                    {hasSubmenu && (
                      <div className="ml-4 space-y-1">
                        {item.submenu.map((subItem) => {
                          const subActive = isActive(subItem.url);
                          return (
                            <SidebarMenuItem key={subItem.title}>
                              <SidebarMenuButton
                                asChild
                                isActive={subActive}
                                className={cn(
                                  "mx-2 transition-colors hover:bg-accent hover:text-accent-foreground text-sm",
                                  subActive &&
                                    "bg-accent text-accent-foreground"
                                )}
                              >
                                <Link
                                  to={subItem.url}
                                  className="flex items-center gap-3 px-3 py-2"
                                >
                                  {subItem.icon && (
                                    <subItem.icon className="h-3.5 w-3.5 flex-shrink-0" />
                                  )}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-medium text-muted-foreground">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">
              admin@alpha.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
