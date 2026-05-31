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
  Box,
  Album,
  LayersPlus,
  CreditCard,
  Boxes,
  X,
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
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    title: "Sản phẩm",
    icon: ShoppingCart,
    submenu: [
      { title: "Danh sách", icon: Package, href: "/admin-products" },
      { title: "Thêm mới", icon: PlusCircle, href: "/admin-products/create" },
    ],
  },
  { title: "Người dùng", icon: Users, href: "/admin-users" },
  {
    title: "Thương hiệu",
    icon: Tags,
    submenu: [
      { title: "Danh sách", icon: Album, href: "/admin-brands" },
      { title: "Thêm mới", icon: LayersPlus, href: "/admin-brands/create" },
    ],
  },
  {
    title: "Danh mục",
    icon: FolderTree,
    submenu: [
      { title: "Danh sách", icon: Album, href: "/admin-categories" },
      { title: "Thêm mới", icon: LayersPlus, href: "/admin-categories/create" },
    ],
  },
  {
    title: "Hộp",
    icon: Boxes,
    submenu: [
      { title: "Danh sách", icon: Album, href: "/admin-box" },
      { title: "Thêm mới", icon: LayersPlus, href: "/admin-box/create" },
    ],
  },
  {
    title: "Gói đăng ký",
    icon: CreditCard,
    submenu: [
      { title: "Danh sách", icon: Album, href: "/admin-subscribe-plan" },
    ],
  },
  { title: "Hồ sơ cá nhân", icon: User, href: "/profile" },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState(["Sản phẩm"]);

  const handleLogout = () => {
    // Xóa cả localStorage và sessionStorage
    // (saveToken lưu vào sessionStorage khi không chọn "Ghi nhớ")
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Dùng window.location.href thay vì router.push để:
    // 1. Force reload hoàn toàn → AppContext reset về null
    // 2. Tránh withGuest thấy user cũ trong state rồi redirect ngược lại /dashboard
    window.location.href = "/login";
  };

  const toggleMenu = (title) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((i) => i !== title) : [...prev, title],
    );
  };

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-semibold">
              Management
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
                            <item.icon className="h-4 w-4" /> {item.title}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              openMenus.includes(item.title) && "rotate-180",
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive(sub.href)}
                                className="pl-8"
                              >
                                <Link href={sub.href}>
                                  <sub.icon className="h-4 w-4" /> {sub.title}
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
                        <item.icon className="h-4 w-4" /> {item.title}
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
              className="text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
