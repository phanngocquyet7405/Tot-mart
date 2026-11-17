"use client";

import { Eye, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminEmptyState } from "../shared";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { getOrderItemsCount } from "../../admin-orders/services/ordersAdminService";
import { formatCurrency, formatDateTime } from "@/app/util/formatter";

function PaymentMethodTag({ method }) {
  if (method === "online") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
        <CreditCard size={13} /> SePay
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-success-text font-medium">
      <Wallet size={13} /> COD
    </span>
  );
}

export function OrderTable({ orders, onViewDetail }) {
  if (orders.length === 0) {
    return <AdminEmptyState message="Không có đơn hàng nào phù hợp với bộ lọc." />;
  }

  return (
    <div className="space-y-4">
      {/* Giao diện Bảng trên Desktop (>= 768px) */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Thương hiệu</TableHead>
              <TableHead className="text-center">SL sản phẩm</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead className="w-14 text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => onViewDetail(order)}
              >
                <TableCell className="font-mono text-xs font-semibold">
                  {order.code}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{order.customer.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {order.customer.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <PaymentMethodTag method={order.paymentMethod} />
                </TableCell>
                <TableCell className="text-sm">
                  {[...new Set(order.items.map((item) => item.brandName))].join(", ") || "—"}
                </TableCell>
                <TableCell className="text-center text-sm tabular-nums">
                  {getOrderItemsCount(order)}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold tabular-nums">
                  {formatCurrency(order.totalPrice)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateTime(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(order);
                    }}
                    aria-label={`Xem chi tiết đơn ${order.code}`}
                  >
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Giao diện Thẻ trên Mobile (< 768px) */}
      <div className="grid gap-3 md:hidden">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-xl border border-border bg-card p-4 space-y-3 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => onViewDetail(order)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-foreground">
                {order.code}
              </span>
              <OrderStatusBadge status={order.status} size="sm" />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{order.customer.name} · {order.customer.phone}</span>
              <PaymentMethodTag method={order.paymentMethod} />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-xs text-muted-foreground">
                {getOrderItemsCount(order)} sản phẩm
              </span>
              <span className="text-base font-bold tabular-nums text-foreground">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full min-h-11 mt-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(order);
              }}
            >
              <Eye className="mr-2 size-4" /> Xem chi tiết
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
