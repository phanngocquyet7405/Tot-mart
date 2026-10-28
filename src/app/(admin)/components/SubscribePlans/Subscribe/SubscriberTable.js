"use client";
/**
 * SubscriberTable.js
 * Bảng hiển thị danh sách người đăng ký với pagination + row click mở detail.
 * Hỗ trợ mobile card layout dưới 768px.
 */

import { useState } from "react";
import { Eye, ChevronLeft, ChevronRight, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriberStatusBadge } from "./Subscriberstatusbadge";
import { formatCurrency, PLAN_TYPE_LABELS } from "@/app/util/formatter";

const PAGE_SIZE = 10;

function EmptyRow() {
  return (
    <div className="py-16 text-center text-muted-foreground">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <Package size={24} className="text-muted-foreground opacity-40" />
        </div>
        <p className="text-sm font-semibold text-foreground">Không có dữ liệu</p>
        <p className="text-xs text-muted-foreground">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
        </p>
      </div>
    </div>
  );
}

export function SubscriberTable({ subscriptions, onViewDetail }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(subscriptions.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = subscriptions.slice(start, start + PAGE_SIZE);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  const safeSetPage = (p) => setPage(Math.min(p, Math.max(totalPages, 1)));

  return (
    <div className="flex flex-col gap-0 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Mobile Card Layout (< 768px) */}
      <div className="md:hidden divide-y divide-border">
        {paginated.length === 0 ? (
          <EmptyRow />
        ) : (
          paginated.map((sub, idx) => (
            <Card
              key={sub._id}
              className="rounded-none border-x-0 border-t-0 shadow-none cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => onViewDetail(sub)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                      {sub.userId?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {sub.userId?.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {sub.userId?.email ?? "—"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 shrink-0 -mr-2 -mt-2 text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(sub);
                    }}
                  >
                    <Eye size={18} />
                  </Button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gói đăng ký:</span>
                    <span className="font-medium text-foreground">
                      {sub.templateId?.name ?? "—"} (
                      {PLAN_TYPE_LABELS[sub.planType] ?? sub.planType})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tiến độ giao:</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {sub.remainDeliveries ?? 0}/{sub.totalDeliveries ?? 0} lần
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Giá:</span>
                    <span className="font-bold text-primary tabular-nums">
                      {formatCurrency(sub.price ?? 0)}
                    </span>
                  </div>
                  {sub.nextDeliveries && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Giao tiếp theo:</span>
                      <span className="font-medium text-foreground tabular-nums">
                        {formatDate(sub.nextDeliveries)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <SubscriberStatusBadge status={sub.status} size="sm" />
                  {sub.cancelAtPeriodEnd && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning-text">
                      <AlertTriangle size={12} /> Hủy cuối kỳ
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">
                #
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                Người dùng
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                Gói
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                Giao tiếp theo
              </th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                Giá
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyRow />
                </td>
              </tr>
            ) : (
              paginated.map((sub, idx) => (
                <tr
                  key={sub._id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => onViewDetail(sub)}
                >
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      {start + idx + 1}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                        {sub.userId?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">
                          {sub.userId?.name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight">
                          {sub.userId?.email ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {sub.templateId?.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {PLAN_TYPE_LABELS[sub.planType] ?? sub.planType}
                        {" · "}
                        {sub.remainDeliveries ?? 0}/{sub.totalDeliveries ?? 0} lần
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <SubscriberStatusBadge status={sub.status} size="sm" />
                      {sub.cancelAtPeriodEnd && (
                        <span className="text-[11px] font-medium text-warning-text flex items-center gap-1">
                          <AlertTriangle size={11} /> Hủy cuối kỳ
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-xs text-foreground tabular-nums">
                      {sub.nextDeliveries ? (
                        formatDate(sub.nextDeliveries)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div>
                      <p className="text-xs font-bold text-primary tabular-nums">
                        {formatCurrency(sub.price ?? 0)}
                      </p>
                      {sub.discountPercent > 0 && (
                        <p className="text-[11px] text-muted-foreground line-through tabular-nums">
                          {formatCurrency(sub.oldPrice ?? 0)}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(sub);
                      }}
                      className="h-8 w-8 pointer-coarse:min-h-11 pointer-coarse:min-w-11 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye size={15} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20">
          <span className="text-xs text-muted-foreground tabular-nums">
            Trang <strong className="text-foreground">{page}</strong> / {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => safeSetPage(page - 1)}
              disabled={page === 1}
              className="min-h-11 min-w-11"
            >
              <ChevronLeft size={16} />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="text-xs text-muted-foreground px-1"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={page === item ? "default" : "outline"}
                    onClick={() => safeSetPage(item)}
                    className="min-h-11 min-w-11 text-xs tabular-nums"
                  >
                    {item}
                  </Button>
                )
              )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => safeSetPage(page + 1)}
              disabled={page === totalPages}
              className="min-h-11 min-w-11"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
