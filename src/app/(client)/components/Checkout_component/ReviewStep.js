/**
 * ReviewStep.js
 * Bước 2 — Kiểm tra đơn hàng: sản phẩm, gói subscribe, địa chỉ đã chọn
 * Palette: indigo-600 primary, slate colors
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Package, RefreshCcw, MapPin, CalendarDays } from "lucide-react";
import { SectionCard } from "./SectionCard";

const fmt = (n) => (n ?? 0).toLocaleString("vi-VN");

// ─── Product item row ─────────────────────────────────────────────────────────
function ProductRow({ item }) {
  return (
    <div className="flex gap-3 items-center">
      <div className="w-14 h-14 rounded-lg bg-indigo-50 overflow-hidden shrink-0 border border-slate-200 relative">
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain p-1.5"
            sizes="56px"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</p>
        <p className="text-xs text-slate-600 mt-0.5">
          x{item.quantity} · {fmt(item.price)}₫/sp
        </p>
      </div>
      <p className="text-sm font-black text-indigo-600 shrink-0">
        {fmt(item.price * item.quantity)}₫
      </p>
    </div>
  );
}

// ─── Subscribe item row ───────────────────────────────────────────────────────
function SubscribeRow({ sub }) {
  return (
    <div className="flex gap-3 items-center">
      <div className="w-14 h-14 rounded-lg bg-indigo-50 overflow-hidden shrink-0 border border-slate-200 relative">
        {sub.boxImage && (
          <Image
            src={sub.boxImage}
            alt={sub.boxName}
            fill
            className="object-contain p-1.5"
            sizes="56px"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 line-clamp-1">{sub.boxName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <CalendarDays size={11} className="text-indigo-600" />
          <p className="text-xs text-slate-600">
            {sub.planLabel} · {sub.totalDeliveries} lần giao
          </p>
        </div>
        {sub.discountPercent > 0 && (
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
            Tiết kiệm {fmt(sub.save)}₫
          </p>
        )}
      </div>
      <p className="text-sm font-black text-indigo-600 shrink-0">
        {fmt(sub.totalPrice)}₫
      </p>
    </div>
  );
}

// ─── Address summary ──────────────────────────────────────────────────────────
function AddressSummary({ addr, user, onEdit }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-900">
        {addr.fullName || user?.name}
      </p>
      {addr.phone && (
        <p className="text-xs text-slate-600 mt-0.5">{addr.phone}</p>
      )}
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
        {[addr.street, addr.ward, addr.district, addr.province]
          .filter(Boolean)
          .join(", ")}
      </p>
      <button
        onClick={onEdit}
        className="text-xs text-indigo-600 hover:text-indigo-700 font-bold mt-2 transition-colors duration-200"
      >
        Thay đổi
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ReviewStep({
  cartItems,
  cartCount,
  subscribeItems,
  subscribeCount,
  hasProducts,
  hasSubscribes,
  selectedAddress,
  newAddress,
  user,
  onBack,
  onNext,
}) {
  const deliveryAddr = selectedAddress ?? newAddress;

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-4"
    >
      {/* Sản phẩm thường */}
      {hasProducts && (
        <SectionCard
          title={`Sản phẩm (${cartCount})`}
          icon={<Package size={16} />}
        >
          <div className="space-y-3">
            {cartItems.map((item, i) => (
              <ProductRow key={item._id || item.id || i} item={item} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Gói subscribe */}
      {hasSubscribes && (
        <SectionCard
          title={`Gói Subscribe (${subscribeCount})`}
          icon={<RefreshCcw size={16} />}
        >
          <div className="space-y-3">
            {subscribeItems.map((sub) => (
              <SubscribeRow key={sub.key} sub={sub} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Địa chỉ đã chọn */}
      <SectionCard title="Địa chỉ giao hàng" icon={<MapPin size={16} />}>
        <AddressSummary
          addr={deliveryAddr}
          user={user}
          onEdit={onBack}
        />
      </SectionCard>

      {/* CTA */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-slate-200 text-slate-600 py-3.5 rounded-lg font-bold uppercase tracking-widest text-[11px] hover:border-indigo-600/30 hover:text-indigo-600 transition-all duration-200"
        >
          ← Quay lại
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-lg font-black uppercase tracking-widest text-[12px] transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-600/20"
        >
          Tiếp theo → Thanh toán
        </button>
      </div>
    </motion.div>
  );
}
