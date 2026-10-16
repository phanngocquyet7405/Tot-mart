import { LayoutDashboard, ShoppingCart, ClipboardList, Users, Tags, FolderTree, User, Package, PlusCircle, Album, LayersPlus, CreditCard, Boxes } from "lucide-react";

export const adminNavigation = [
  { label: 'Giao hàng & đối soát', icon: CreditCard, href: '/admin-operations' },
  { label: "Tổng quan", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "Sản phẩm",
    icon: ShoppingCart,
    children: [
      { label: "Danh sách", icon: Package, href: "/admin-products" },
      { label: "Thêm mới", icon: PlusCircle, href: "/admin-products/create" },
    ],
  },
  { label: "Người dùng", icon: Users, href: "/admin-users" },
  { label: "Đơn hàng", icon: ClipboardList, href: "/admin-orders" },
  {
    label: "Thương hiệu",
    icon: Tags,
    children: [
      { label: "Danh sách", icon: Album, href: "/admin-brands" },
      { label: "Thêm mới", icon: LayersPlus, href: "/admin-brands/create" },
    ],
  },
  {
    label: "Danh mục",
    icon: FolderTree,
    children: [
      { label: "Danh sách", icon: Album, href: "/admin-categories" },
      { label: "Thêm mới", icon: LayersPlus, href: "/admin-categories/create" },
    ],
  },
  {
    label: "Hộp",
    icon: Boxes,
    children: [
      { label: "Danh sách", icon: Album, href: "/admin-box" },
      { label: "Thêm mới", icon: LayersPlus, href: "/admin-box/create" },
    ],
  },
  {
    label: "Gói đăng ký",
    icon: CreditCard,
    children: [
      {
        label: "Danh sách các gói",
        icon: Album,
        href: "/admin-subscribe-plan",
      },
      {
        label: "Các gói đăng ký",
        icon: Album,
        href: "/admin-subscribe-plan/registered",
      },
    ],
  },
  { label: "Hồ sơ cá nhân", icon: User, href: "/profile" },
];
