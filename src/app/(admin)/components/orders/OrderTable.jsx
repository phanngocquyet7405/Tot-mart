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
  if (method === "vnpay") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-indigo-600">
        <CreditCard size={13} /> VNPay
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
      <Wallet size={13} /> COD
    </span>
  );
}

export function OrderTable({ orders, onViewDetail }) {
  if (orders.length === 0) {
    return <AdminEmptyState message="Không có đơn hàng nào phù hợp với bộ lọc." />;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Thanh toán</TableHead>
            <TableHead className="text-center">SL sản phẩm</TableHead>
            <TableHead className="text-right">Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead className="w-12 text-right">Chi tiết</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-muted/40"
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
              <TableCell className="text-center text-sm">
                {getOrderItemsCount(order)}
              </TableCell>
              <TableCell className="text-right text-sm font-semibold">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail(order);
                  }}
                >
                  <Eye size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
