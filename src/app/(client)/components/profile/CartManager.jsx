"use client";

import { Minus, Plus, ShoppingCart, Trash2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price || 0);

export function CartManager({ cart, loading, onChangeQuantity, onRemoveItem }) {
  return (
    <Card className="border-border bg-card shadow-xs rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
        <CardTitle className="text-foreground text-lg font-bold">
          Giỏ hàng của tôi
        </CardTitle>
        <div className="flex items-center gap-2">
          <Link href="/profile/my-subscriptions">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-border text-foreground hover:bg-muted min-h-9 px-3 rounded-lg font-medium"
            >
              <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Gói đăng ký của tôi
            </Button>
          </Link>
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2.5 py-1">
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            {cart.length} món
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Giỏ hàng của bạn đang trống. Hãy thêm sản phẩm để tiếp tục mua sắm.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center min-h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-xs"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : null}

        <div className="divide-y divide-border/60">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-foreground truncate">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Mã SP: {item.productId}
                  </p>
                  <p className="text-xs font-bold text-primary tabular-nums mt-0.5">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-none"
                    disabled={loading || item.quantity <= 1}
                    onClick={() =>
                      onChangeQuantity(item.productId, item.quantity - 1)
                    }
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="min-w-9 text-center text-xs font-bold tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-none"
                    disabled={loading}
                    onClick={() =>
                      onChangeQuantity(item.productId, item.quantity + 1)
                    }
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-destructive/25 text-destructive-text hover:bg-destructive/10"
                  disabled={loading}
                  onClick={() => onRemoveItem(item.productId)}
                  aria-label="Xóa sản phẩm khỏi giỏ"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
