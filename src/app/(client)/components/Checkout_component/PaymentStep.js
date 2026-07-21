/**
 * PaymentStep.js
 * Bước 3 — Chọn phương thức thanh toán + mã giảm giá + đặt hàng
 * Palette: indigo-600 primary, slate colors, rose-600 accent
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
        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
        selected
          ? "border-indigo-600 bg-indigo-50"
          : "border-slate-200 bg-white hover:border-indigo-600/40 hover:shadow-sm",
      ].join(" ")}
    >
      {/* Custom radio */}
      <div
        className={[
          "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-200",
          selected
            ? "border-indigo-600 bg-indigo-600"
            : "border-slate-300 bg-white",
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
        <p className="text-sm font-bold text-slate-900">{method.label}</p>
        <p className="text-xs text-slate-600">{method.desc}</p>
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
          className="flex-1 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all duration-200 uppercase disabled:opacity-60"
        />
        <button
          onClick={onApply}
          disabled={!coupon.trim() || couponApplied}
          className={[
            "px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200",
            couponApplied
              ? "bg-emerald-500 text-white cursor-default"
              : "bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white",
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
      <div className="flex items-center gap-2 text-slate-600 px-1">
        <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
        <p className="text-xs">
          Thông tin thanh toán được mã hóa và bảo mật tuyệt đối.
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-slate-200 text-slate-600 py-3.5 rounded-lg font-bold uppercase tracking-widest text-[11px] hover:border-indigo-600/30 hover:text-indigo-600 transition-all duration-200"
        >
          ← Quay lại
        </button>
        <button
          onClick={onPlaceOrder}
          disabled={submitting}
          className="flex-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3.5 rounded-lg font-black uppercase tracking-widest text-[12px] transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
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
