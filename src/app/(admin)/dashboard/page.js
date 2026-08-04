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
    color: "indigo",
    href: "/admin-products",
  },
  {
    key: "categories",
    label: "Danh mục",
    icon: Layers,
    color: "blue",
    href: "/admin-categories",
  },
  {
    key: "brands",
    label: "Thương hiệu",
    icon: Tag,
    color: "amber",
    href: "/admin-brands",
  },
  {
    key: "boxes",
    label: "Box",
    icon: Boxes,
    color: "pink",
    href: "/admin-box",
  },
  {
    key: "users",
    label: "Người dùng",
    icon: Users,
    color: "emerald",
    href: "/admin-users",
  },
  {
    key: "subscribePlans",
    label: "Gói đăng ký",
    icon: Repeat,
    color: "orange",
    href: "/admin-subscribe-plan",
  },
];

const COLOR_CLASSES = {
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", value: "text-indigo-700" },
  blue: { bg: "bg-blue-100", text: "text-blue-600", value: "text-blue-700" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", value: "text-amber-700" },
  pink: { bg: "bg-pink-100", text: "text-pink-600", value: "text-pink-700" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", value: "text-emerald-700" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", value: "text-orange-700" },
};

const QUICK_LINKS = [
  { label: "Thêm sản phẩm", href: "/admin-products/create" },
  { label: "Thêm thương hiệu", href: "/admin-brands/create" },
  { label: "Thêm danh mục", href: "/admin-categories/create" },
  { label: "Thêm box", href: "/admin-box/create" },
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
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Làm mới
          </Button>
        }
      />

      {loading && !stats ? (
        <AdminLoadingState message="Đang tải số liệu tổng quan..." />
      ) : error && !stats ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-destructive/5 border-destructive/20">
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={refresh}>
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          {/* Stats chính */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {STAT_CARDS.map(({ key, label, icon: Icon, color, href }) => {
              const c = COLOR_CLASSES[color];
              return (
                <Link key={key} href={href}>
                  <Card className="cursor-pointer transition-all hover:border-zinc-300 hover:shadow-sm h-full">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className={cn("w-fit p-2.5 rounded-xl", c.bg)}>
                        <Icon className={cn("h-5 w-5", c.text)} />
                      </div>
                      <div>
                        <p className={cn("text-2xl font-bold", c.value)}>
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
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Cảnh báo tồn kho
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/admin-products"
                  className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100/60 transition-colors"
                >
                  <div className="p-2.5 rounded-xl bg-amber-100">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">
                      {stats?.lowStockProducts ?? 0}
                    </p>
                    <p className="text-xs text-amber-700/80">
                      Sản phẩm sắp hết hàng (≤ 10)
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin-products"
                  className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 hover:bg-destructive/10 transition-colors"
                >
                  <div className="p-2.5 rounded-xl bg-destructive/10">
                    <PackageX className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">
                      {stats?.outOfStockProducts ?? 0}
                    </p>
                    <p className="text-xs text-destructive/80">
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
                    className="justify-start"
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
