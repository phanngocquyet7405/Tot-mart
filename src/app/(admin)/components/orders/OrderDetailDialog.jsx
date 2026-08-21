"use client";

import {
  Package,
  MapPin,
  StickyNote,
  Loader2,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  getNextStatusOptions,
  getOrderItemsCount,
} from "../../admin-orders/services/ordersAdminService";
import { formatCurrency, formatDateTime } from "@/app/util/formatter";

function SectionLabel({ icon: Icon, label }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
      <Icon size={12} />
      {label}
    </p>
  );
}

function AddressBlock({ address }) {
  if (!address) return <p className="text-sm text-muted-foreground">—</p>;
  const parts = [address.street, address.ward, address.district, address.province]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="text-sm">
      <p className="font-medium">{address.fullName}</p>
      <p className="text-muted-foreground">{address.phone}</p>
      <p className="text-muted-foreground mt-0.5">{parts || "—"}</p>
    </div>
  );
}

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  onChangeStatus,
  isUpdatingStatus,
}) {
  if (!order) return null;

  const nextOptions = getNextStatusOptions(order.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 pr-6">
            <span>Đơn hàng {order.code}</span>
            <OrderStatusBadge status={order.status} size="md" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Khách hàng + thanh toán */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SectionLabel icon={Package} label="Khách hàng" />
              <p className="text-sm font-medium">{order.customer.name}</p>
              <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
            </div>
            <div>
              <SectionLabel
                icon={order.paymentMethod === "vnpay" ? CreditCard : Wallet}
                label="Thanh toán"
              />
              <p className="text-sm font-medium">
                {order.paymentMethod === "vnpay" ? "VNPay" : "COD - Tiền mặt"}
              </p>
              <p className="text-xs text-muted-foreground">
                Đặt lúc {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Địa chỉ giao hàng */}
          <div>
            <SectionLabel icon={MapPin} label="Địa chỉ giao hàng" />
            <AddressBlock address={order.address} />
          </div>

          {order.note && (
            <div>
              <SectionLabel icon={StickyNote} label="Ghi chú" />
              <p className="text-sm text-muted-foreground italic">{order.note}</p>
            </div>
          )}

          <Separator />

          {/* Sản phẩm */}
          <div>
            <SectionLabel icon={Package} label={`Sản phẩm (${getOrderItemsCount(order)})`} />
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={item.productId ?? idx}
                  className="flex items-center justify-between text-sm rounded-lg border border-border/60 px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      SL: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency((item.price ?? 0) * (item.quantity ?? 1))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tổng kết */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Giảm giá</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-1">
              <span>Tổng cộng</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>

          {/* Đổi trạng thái */}
          {nextOptions.length > 0 && (
            <>
              <Separator />
              <div>
                <SectionLabel icon={Package} label="Cập nhật trạng thái" />
                <div className="flex flex-wrap gap-2">
                  {nextOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant="outline"
                      disabled={isUpdatingStatus}
                      onClick={() => onChangeStatus(order, opt.value)}
                    >
                      {isUpdatingStatus && (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      )}
                      Chuyển sang: {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
