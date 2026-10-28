"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Package,
  Boxes,
  Gift,
  CalendarDays,
  ShoppingBag,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { listManagerResource } from '../services/managerApi';
import { managerError, money } from '../lib/productModel.mjs';
import { PageTitle, ErrorPanel, ItemThumbnail } from './WorkspaceUI';
import { orderStatuses } from './OrdersWorkspace';

const sections = [
  { kind: 'products', label: 'Sản phẩm', href: '/manager/products', icon: Package },
  { kind: 'combos', label: 'Combo', href: '/manager/combos', icon: Boxes },
  { kind: 'gifts', label: 'Gift', href: '/manager/gifts', icon: Gift },
  { kind: 'subscriptions', label: 'Đăng ký hàng tháng', href: '/manager/subscriptions', icon: CalendarDays },
  { kind: 'orders', label: 'Đơn hàng', href: '/manager/orders', icon: ShoppingBag },
];

function statusBadgeVariant(status) {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'pending':
    case 'on_hold':
      return 'warning';
    case 'cancelled':
    case 'returned':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default function OverviewWorkspace() {
  const [version, setVersion] = useState(0);
  const [data, setData] = useState({ version: -1, results: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all(
      sections.map(async ({ kind }) => {
        try {
          const limit = kind === 'orders' ? 5 : 1;
          const result = await listManagerResource(kind, { limit, signal: controller.signal });
          if (
            result.success === false ||
            !Array.isArray(result.data) ||
            !Number.isSafeInteger(result.pagination?.total)
          ) {
            throw new Error('BE chưa trả tổng số hợp lệ.');
          }
          return { kind, total: result.pagination.total, rows: result.data };
        } catch (error) {
          return { kind, total: null, rows: [], error: managerError(error) };
        }
      })
    ).then((results) => {
      if (!controller.signal.aborted) {
        setData({ version, results });
        setLoading(false);
      }
    });

    return () => controller.abort();
  }, [version]);

  const ordersData = data.results.find((item) => item.kind === 'orders');
  const recentOrders = ordersData?.rows || [];
  const pendingOrders = recentOrders.filter(
    (order) => order.status === 'pending' || order.status === 'processing'
  );

  const totalAll = data.results.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const hasErrors = data.results.some((item) => item.error);
  const isAllEmpty = !loading && data.version === version && totalAll === 0 && !hasErrors;

  return (
    <section aria-labelledby="overview-heading" className="space-y-6">
      <PageTitle
        id="overview-heading"
        title="Tổng quan"
        description="Số lượng và đơn hàng gần đây trong phạm vi cửa hàng của bạn."
      />

      {/* State 3: Error Notification */}
      {hasErrors && (
        <ErrorPanel onRetry={() => setVersion((v) => v + 1)}>
          Một số nguồn dữ liệu chưa tải được. Các số liệu lỗi được giữ nguyên trạng thái chưa xác định.
        </ErrorPanel>
      )}

      {/* State 1: Loading Skeleton */}
      {loading ? (
        <div className="space-y-6" role="status">
          <span className="sr-only">Đang tải tổng quan…</span>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      ) : isAllEmpty ? (
        /* State 2: Empty State */
        <EmptyState
          icon={ShoppingBag}
          title="Cửa hàng chưa có dữ liệu"
          description="Bạn chưa có sản phẩm, combo hay đơn hàng nào. Hãy bắt đầu bằng việc thêm sản phẩm đầu tiên."
          action={
            <Button asChild className="min-h-11">
              <Link href="/manager/products">Thêm sản phẩm đầu tiên</Link>
            </Button>
          }
        />
      ) : (
        /* State 4 & 5: Normal / Success / Actionable View */
        <div className="space-y-6">
          {/* Thẻ số liệu (tabular-nums) */}
          <section aria-label="Thẻ thống kê số lượng">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {sections.map(({ kind, label, href, icon: Icon }) => {
                const item = data.results.find((r) => r.kind === kind);
                return (
                  <Card key={kind} className="transition-all hover:border-primary/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {label}
                      </CardTitle>
                      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {item?.error ? (
                        <p className="text-xs font-medium text-destructive-text">Lỗi tải</p>
                      ) : (
                        <div className="text-2xl font-bold tabular-nums text-foreground">
                          {item?.total ?? '—'}
                        </div>
                      )}
                      <Link
                        href={href}
                        className="inline-flex min-h-6 items-center text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        Quản lý <ArrowRight className="ml-1 size-3" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Tổng số lượng được lấy trực tiếp từ API phân trang của từng danh mục thuộc quyền quản lý của bạn.
            </p>
          </section>

          {/* Khối Việc cần làm + Đơn hàng gần đây */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Khối Việc cần làm */}
            <Card>
              <CardHeader className="border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-primary" aria-hidden="true" />
                  <CardTitle className="text-base font-semibold">Việc cần làm</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                {pendingOrders.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 shrink-0 text-warning-text" />
                        <span className="font-medium text-warning-text">
                          Có {pendingOrders.length} đơn hàng cần xử lý hoặc chuẩn bị
                        </span>
                      </div>
                      <Button asChild size="sm" variant="outline" className="min-h-9 border-warning/40 text-xs">
                        <Link href="/manager/orders">Xử lý ngay</Link>
                      </Button>
                    </div>
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {pendingOrders.map((order) => (
                        <li key={order._id} className="flex items-center justify-between p-3 text-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <ItemThumbnail
                              image={order.products?.[0]?.image || order.products?.[0]?.images?.[0]}
                              name={order.orderId}
                              icon={ShoppingBag}
                              className="size-10 rounded-md shrink-0"
                            />
                            <div className="min-w-0">
                              <Link
                                href="/manager/orders"
                                className="font-medium text-foreground underline-offset-4 hover:underline"
                              >
                                {order.orderId}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {order.paymentMethod === 'cod' ? 'COD' : 'Online'} · {money(order.totalAmount)}
                              </p>
                            </div>
                          </div>
                          <Badge variant={statusBadgeVariant(order.status)}>
                            {orderStatuses[order.status] || order.status}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle2 className="size-8 text-success-text" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Không có đơn hàng tồn đọng
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tất cả đơn hàng gần đây đã được xác nhận hoặc bắt đầu giao.
                    </p>
                  </div>
                )}

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground">Lối tắt thao tác nhanh:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="min-h-9 text-xs">
                      <Link href="/manager/products">+ Thêm sản phẩm</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="min-h-9 text-xs">
                      <Link href="/manager/combos">+ Tạo combo</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="min-h-9 text-xs">
                      <Link href="/manager/orders">Xem tất cả đơn hàng</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Đơn hàng gần đây */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
                <CardTitle className="text-base font-semibold">Đơn hàng gần đây</CardTitle>
                <Link
                  href="/manager/orders"
                  className="inline-flex min-h-6 items-center text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  Xem tất cả
                </Link>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                {ordersData?.error ? (
                  <p className="text-sm text-destructive-text">{ordersData.error}</p>
                ) : recentOrders.length > 0 ? (
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {recentOrders.map((order) => (
                      <li
                        key={order._id}
                        className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ItemThumbnail
                            image={order.products?.[0]?.image || order.products?.[0]?.images?.[0]}
                            name={order.orderId}
                            icon={ShoppingBag}
                            className="size-10 rounded-md shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href="/manager/orders"
                              className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                              {order.orderId}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium tabular-nums text-foreground">
                            {money(order.totalAmount)}
                          </span>
                          <Badge variant={statusBadgeVariant(order.status)}>
                            {orderStatuses[order.status] || order.status}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Chưa có đơn hàng nào trong cửa hàng.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
