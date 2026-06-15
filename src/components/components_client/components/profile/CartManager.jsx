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
  }).format(price);

export function CartManager({ cart, loading, onChangeQuantity, onRemoveItem }) {
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Card className="border-emerald-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-emerald-700">My Cart</CardTitle>
        <div className="flex items-center gap-2">
          {/* Nút tạm thời trỏ đến trang /my-subscriptions */}
          <Link href="/profile/my-subscriptions">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-7 px-2"
            >
              <CalendarDays className="mr-1 h-3 w-3" />
              Gói đăng ký của tôi
            </Button>
          </Link>
        </div>
        <Badge className="bg-emerald-600">
          <ShoppingCart className="mr-1 h-3 w-3" />
          {cart.length} items
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.length === 0 ? (
          <p className="text-sm text-slate-500">
            Your cart is currently empty.
          </p>
        ) : null}
        {cart.map((item) => (
          <div
            key={item.productId}
            className="flex flex-col gap-3 rounded-lg border border-emerald-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <Image
                src={item.imageUrl}
                alt={item.productName}
                className="h-14 w-14 rounded-md object-cover"
              />
              <div>
                <p className="font-medium text-slate-800">{item.productName}</p>
                <p className="text-sm text-slate-500">ID: {item.productId}</p>
                <p className="text-sm font-semibold text-emerald-700">
                  {formatPrice(item.price)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={loading || item.quantity <= 1}
                onClick={() =>
                  onChangeQuantity(item.productId, item.quantity - 1)
                }
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-8 text-center text-sm font-semibold">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={loading}
                onClick={() =>
                  onChangeQuantity(item.productId, item.quantity + 1)
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-red-200 text-red-600 hover:bg-red-50"
                disabled={loading}
                onClick={() => onRemoveItem(item.productId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="border-t border-emerald-100 pt-4 text-right">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-xl font-bold text-emerald-700">
            {formatPrice(total)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
