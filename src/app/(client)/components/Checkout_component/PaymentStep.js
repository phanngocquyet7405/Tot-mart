/**
 * PaymentStep.js
 * Bước 3 — Chọn phương thức thanh toán + mã giảm giá + đặt hàng
 */

"use client";

import { motion } from "framer-motion";
import { CreditCard, Gift, ShieldCheck, Loader2, Check } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { PAYMENT_METHODS } from "@/app/services/api/Checkoutpageservice";

const fmt = (n) => (n ?? 0).toLocaleString("vi-VN");

// ─── Payment method radio ─────────────────────────────────────────────────────
function PaymentMethodCard({ method, selected, onSelect }) {
  return (
    <label
      className={[
        "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
        selected
          ? "border-[#C85C3C] bg-[#FFF5F2]"
          : "border-[#F0DDD5] bg-[#FFFAF8] hover:border-[#C85C3C]/40",
      ].join(" ")}
    >
      {/* Custom radio */}
      <div
        className={[
          "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
          selected
            ? "border-[#C85C3C] bg-[#C85C3C]"
            : "border-stone-300 bg-white",
        ].join(" ")}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <input
        type="radio"
        name="payment"
        value={method.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="text-xl">{method.icon}</span>
      <div>
        <p className="text-sm font-bold text-[#2C1810]">{method.label}</p>
        <p className="text-xs text-stone-400">{method.desc}</p>
      </div>
    </label>
  );
}

// ─── Coupon input ─────────────────────────────────────────────────────────────
function CouponInput({ coupon, setCoupon, couponApplied, discount, onApply }) {
  return (
    <>
      <div className="flex gap-2">
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
          placeholder="Nhập mã (thử: TOTMART10)"
          disabled={couponApplied}
          className="flex-1 bg-[#FFFAF8] border border-[#F0DDD5] rounded-xl px-3.5 py-2.5 text-sm text-[#2C1810] placeholder-stone-300 focus:outline-none focus:border-[#C85C3C] focus:ring-2 focus:ring-[#C85C3C]/10 transition-all uppercase disabled:opacity-60"
        />
        <button
          onClick={onApply}
          disabled={!coupon.trim() || couponApplied}
          className={[
            "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
            couponApplied
              ? "bg-emerald-500 text-white cursor-default"
              : "bg-[#C85C3C] hover:bg-[#B14B2D] disabled:bg-stone-200 disabled:text-stone-400 text-white",
          ].join(" ")}
        >
          {couponApplied ? (
            <span className="flex items-center gap-1">
              <Check size={12} /> Đã áp
            </span>
          ) : (
            "Áp dụng"
          )}
        </button>
      </div>
      {couponApplied && (
        <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
          <Check size={11} /> Đã giảm {fmt(discount)}₫
        </p>
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function PaymentStep({
  paymentMethod,
  setPaymentMethod,
  coupon,
  setCoupon,
  couponApplied,
  discount,
  finalTotal,
  submitting,
  onApplyCoupon,
  onBack,
  onPlaceOrder,
}) {
  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-4"
    >
      {/* Phương thức thanh toán */}
      <SectionCard
        title="Phương thức thanh toán"
        icon={<CreditCard size={16} />}
      >
        <div className="space-y-2">
          {PAYMENT_METHODS.map((pm) => (
            <PaymentMethodCard
              key={pm.id}
              method={pm}
              selected={paymentMethod === pm.id}
              onSelect={() => setPaymentMethod(pm.id)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Mã giảm giá */}
      <SectionCard title="Mã giảm giá" icon={<Gift size={16} />}>
        <CouponInput
          coupon={coupon}
          setCoupon={setCoupon}
          couponApplied={couponApplied}
          discount={discount}
          onApply={onApplyCoupon}
        />
      </SectionCard>

      {/* Security note */}
      <div className="flex items-center gap-2 text-stone-400 px-1">
        <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
        <p className="text-xs">
          Thông tin thanh toán được mã hóa và bảo mật tuyệt đối.
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-[#F0DDD5] text-stone-500 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:border-[#C85C3C]/30 hover:text-[#C85C3C] transition-all"
        >
          ← Quay lại
        </button>
        <button
          onClick={onPlaceOrder}
          disabled={submitting}
          className="flex-2 bg-[#C85C3C] hover:bg-[#B14B2D] disabled:bg-stone-200 disabled:text-stone-400 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all active:scale-[0.98] shadow-lg shadow-[#C85C3C]/20 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>Đặt hàng · {fmt(finalTotal)}₫</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
