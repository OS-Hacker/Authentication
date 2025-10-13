import { AppSidebar } from "@/pages/dashboard/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function SideBarLayout({ showSidebarTrigger = true }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      {showSidebarTrigger && <SidebarTrigger />}
      <main className="min-h-[calc(100vh-120px)] w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
