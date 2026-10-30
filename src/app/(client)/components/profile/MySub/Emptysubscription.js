"use client";
/**
 * EmptySubscription.js
 * Trạng thái rỗng khi user chưa có gói đăng ký nào
 */

import Link from "next/link";
import { Package, Sparkles } from "lucide-react";

export function EmptySubscription({ filtered = false }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Package size={36} className="text-primary/60" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
          <Sparkles size={13} />
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-1.5 max-w-sm">
        <h3 className="text-base font-bold text-foreground">
          {filtered ? "Không có gói đăng ký nào" : "Bạn chưa đăng ký gói nào"}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {filtered
            ? "Không có gói đăng ký định kỳ nào phù hợp với bộ lọc hiện tại."
            : "Khám phá các combo subscription được tuyển chọn đặc biệt từ TotMart để nhận hộp sản phẩm định kỳ mỗi tháng."}
        </p>
      </div>

      {!filtered && (
        <div className="pt-2">
          <Link
            href="/products/Subscriber"
            className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-colors shadow-xs"
          >
            <Sparkles size={14} />
            Khám phá các gói đăng ký
          </Link>
        </div>
      )}
    </div>
  );
}
