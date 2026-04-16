"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Tags,
  FolderTree,
  User,
  LogOut,
  Package,
  PlusCircle,
  Pencil,
  Trash2,
  ChevronDown,
  Box,
  Album,
  LayersPlus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { title } from "framer-motion/client";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Quản lý sản phẩm",
    icon: ShoppingCart,
    submenu: [
      { title: "Danh sách sản phẩm", icon: Package, href: "/admin-products" },
      {
        title: "Thêm sản phẩm",
        icon: PlusCircle,
        href: "/admin-products/create",
      },
      {
        title: "Cập nhật sản phẩm",
        icon: Pencil,
        href: "/admin-products/update",
      },
      { title: "Xoá sản phẩm", icon: Trash2, href: "/admin-products/delete" },
    ],
  },
  {
    title: "Quản lý người dùng",
    icon: Users,
    href: "/admin-users/",
  },
  {
    title: "Quản lý thương hiệu",
    icon: Tags,
    submenu: [
      { title: "Danh sách thương hiệu", icon: Album, href: "/admin-brands" },
      {
        title: "Thêm thương hiệu",
        icon: LayersPlus,
        href: "/admin-brands/create",
      },
      {
        title: "Cập nhật thương hiệu",
        icon: Pencil,
        href: "/admin-brands/update",
      },
      {
        title: "Xoá thương hiệu",
        icon: Trash2,
        href: "/admin-brands/delete",
      },
    ],
  },
  {
    title: "Quản lý loại sản phẩm",
    icon: FolderTree,
    submenu: [
      {
        title: "Danh sách loại sản phẩm",
        icon: Album,
        href: "/admin-categories",
      },
      {
        title: "Thêm loại sản phẩm",
        icon: LayersPlus,
        href: "/admin-categories/create",
      },
      {
        title: "Cập nhật loại sản phẩm",
        icon: Pencil,
        href: "/admin-categories/update",
      },
      {
        title: "xoá loại sản phẩm",
        icon: Trash2,
        href: "/admin-categories/delete",
      },
    ],
  },
  {
    title: "Profile",
    icon: User,
    href: "/profile",
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState(["E-Commerce"]);
  const handleLogout = () => {
    localStorage.removeItem("token");

    router.push("/login");
  };

  const toggleMenu = (title) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Box className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground">
              TotBoxAdmin
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              E-Commerce Platform
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) =>
                item.submenu ? (
                  <Collapsible
                    key={item.title}
                    open={openMenus.includes(item.title)}
                    onOpenChange={() => toggleMenu(item.title)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between">
                          <span className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              openMenus.includes(item.title) && "rotate-180",
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive(subItem.href)}
                                className="pl-8"
                              >
                                <Link href={subItem.href}>
                                  <subItem.icon className="h-4 w-4" />
                                  {subItem.title}
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarSeparator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
