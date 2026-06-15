/**
 * EmptySubscription.js
 * Trạng thái rỗng khi user chưa có gói đăng ký nào
 */

"use client";

import Link from "next/link";
import { Package, Sparkles } from "lucide-react";

export function EmptySubscription({ filtered = false }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      {/* Icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-[#FFF0EB] to-[#F0DDD5] flex items-center justify-center">
          <Package size={40} className="text-[#C85C3C]/40" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#C85C3C] flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-2 max-w-xs">
        <h3 className="text-lg font-black text-stone-700">
          {filtered ? "Không có gói nào" : "Bạn chưa đăng ký gói nào"}
        </h3>
        <p className="text-sm text-stone-400 leading-relaxed">
          {filtered
            ? "Không có gói đăng ký nào khớp với bộ lọc hiện tại."
            : "Khám phá các gói subscription box được tuyển chọn đặc biệt từ TotMart và bắt đầu hành trình nhận hộp quà mỗi tháng."}
        </p>
      </div>

      {!filtered && (
        <Link
          href="/subscribe"
          className="flex items-center gap-2 px-6 py-3 bg-[#C85C3C] hover:bg-[#B14B2D] text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-[#C85C3C]/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles size={14} />
          Khám phá gói đăng ký
        </Link>
      )}
    </div>
  );
}
