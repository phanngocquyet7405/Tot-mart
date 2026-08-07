"use client";

import { useState } from "react";
import { AppSidebar } from "./components/app_sidebar";
import { AdminHeader } from "./components/admin_header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { withAdmin } from "../middleware/roleMiddleware";
import { AdminNotificationProvider } from "../context/NotificationContext";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AdminNotificationProvider>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <AppSidebar />
        <SidebarInset>
          <AdminHeader />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AdminNotificationProvider>
  );
};

export default withAdmin(AdminLayout);
