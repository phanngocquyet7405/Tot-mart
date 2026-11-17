"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  Boxes,
  Users,
  Repeat,
  RefreshCw,
  AlertTriangle,
  PackageX,
  PlusCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { AdminPageHeader, AdminLoadingState } from "../components/shared";
import { withAdmin } from "@/app/middleware/roleMiddleware";
import { useDashboard } from "./hooks/useDashboard";

const STAT_CARDS = [
  {
    key: "products",
    label: "Sản phẩm",
    icon: Package,
    color: "primary",
    href: "/admin-products",
  },
  {
    key: "categories",
    label: "Danh mục",
    icon: Layers,
    color: "primary",
    href: "/admin-categories",
  },
  {
    key: "brands",
    label: "Thương hiệu",
    icon: Tag,
    color: "primary",
    href: "/admin-brands",
  },
  {
    key: "boxes",
    label: "Combo",
    icon: Boxes,
    color: "primary",
    href: "/admin-box",
  },
  {
    key: "users",
    label: "Người dùng",
    icon: Users,
    color: "primary",
    href: "/admin-users",
  },
  {
    key: "subscribePlans",
    label: "Gói đăng ký",
    icon: Repeat,
    color: "primary",
    href: "/admin-subscribe-plan",
  },
];

const COLOR_CLASSES = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  success: { bg: "bg-success/15", text: "text-success-text" },
  warning: { bg: "bg-warning/15", text: "text-warning-text" },
  destructive: { bg: "bg-destructive/15", text: "text-destructive-text" },
};

const QUICK_LINKS = [
  { label: "Thêm sản phẩm", href: "/admin-products/create" },
  { label: "Thêm thương hiệu", href: "/admin-brands/create" },
  { label: "Thêm danh mục", href: "/admin-categories/create" },
  { label: "Thêm combo", href: "/admin-box/create" },
];

function DashboardPage() {
  const { stats, loading, error, refresh } = useDashboard();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Tổng quan số liệu toàn hệ thống"
        icon={LayoutDashboard}
        actions={
          <Button variant="outline" className="min-h-11" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Làm mới
          </Button>
        }
      />

      {loading && !stats ? (
        <AdminLoadingState message="Đang tải số liệu tổng quan..." />
      ) : error && !stats ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-destructive/10 border-destructive/30">
          <p className="text-sm font-medium text-destructive-text mb-4">{error}</p>
          <Button variant="outline" className="min-h-11" onClick={refresh}>
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          {/* Stats chính */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {STAT_CARDS.map(({ key, label, icon: Icon, color, href }) => {
              const c = COLOR_CLASSES[color] || COLOR_CLASSES.primary;
              return (
                <Link key={key} href={href}>
                  <Card className="cursor-pointer transition-all hover:border-border/80 hover:bg-muted/20 hover:shadow-sm h-full">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className={cn("w-fit p-2.5 rounded-xl border border-border/40", c.bg)}>
                        <Icon className={cn("h-5 w-5", c.text)} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold tabular-nums text-foreground">
                          {stats?.[key] ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Cảnh báo tồn kho + Truy cập nhanh */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Cảnh báo tồn kho
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/admin-products"
                  className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/15 p-4 hover:bg-warning/20 transition-colors"
                >
                  <div className="p-2.5 rounded-xl bg-warning/20">
                    <AlertTriangle className="h-5 w-5 text-warning-text" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums text-warning-text">
                      {stats?.lowStockProducts ?? 0}
                    </p>
                    <p className="text-xs text-warning-text/90">
                      Sản phẩm sắp hết hàng (≤ 10)
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin-products"
                  className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/15 p-4 hover:bg-destructive/20 transition-colors"
                >
                  <div className="p-2.5 rounded-xl bg-destructive/20">
                    <PackageX className="h-5 w-5 text-destructive-text" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums text-destructive-text">
                      {stats?.outOfStockProducts ?? 0}
                    </p>
                    <p className="text-xs text-destructive-text/90">
                      Sản phẩm đã hết hàng
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Truy cập nhanh</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {QUICK_LINKS.map((link) => (
                  <Button
                    key={link.href}
                    variant="outline"
                    className="min-h-11 justify-start"
                    asChild
                  >
                    <Link href={link.href}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * THỰC THI BẢO MẬT:
 * Sử dụng withAdmin để bảo vệ route này.
 * Chỉ những người dùng có token hợp lệ và role === 'admin' mới có thể truy cập.
 */
export default withAdmin(DashboardPage);
