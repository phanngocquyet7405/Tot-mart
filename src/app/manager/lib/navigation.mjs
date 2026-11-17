import { LayoutDashboard, Package, Boxes, Gift, CalendarDays, ShoppingBag } from 'lucide-react';

export const managerNavigation = [
  { id: 'overview', label: 'Tổng quan', href: '/manager', icon: LayoutDashboard, exact: true },
  { id: 'products', label: 'Sản phẩm', href: '/manager/products', icon: Package },
  { id: 'combos', label: 'Combo', href: '/manager/combos', icon: Boxes },
  { id: 'gifts', label: 'Gift', href: '/manager/gifts', icon: Gift },
  { id: 'subscriptions', label: 'Đăng ký hàng tháng', href: '/manager/subscriptions', icon: CalendarDays },
  { id: 'orders', label: 'Đơn hàng', href: '/manager/orders', icon: ShoppingBag },
];
