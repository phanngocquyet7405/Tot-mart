/**
 * ReviewStep.js
 * Bước 2 — Kiểm tra đơn: TẤT CẢ sản phẩm (kèm ảnh) + địa chỉ đã chọn.
 */

"use client";

import { motion } from "framer-motion";
import { Package, MapPin } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { CartLine } from "./CartLine";
import { BTN_PRIMARY, BTN_SECONDARY, FOCUS_RING } from "./checkoutStyles";

function AddressSummary({ addr, user, onEdit }) {
  const line = [addr?.street, addr?.ward, addr?.district, addr?.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <p className="text-sm font-semibold text-[#2C1810]">
        {addr?.fullName || user?.name}
      </p>
      {addr?.phone && (
        <p className="text-sm text-stone-600 mt-0.5">{addr.phone}</p>
      )}
      {line && (
        <p className="text-sm text-stone-500 mt-1 leading-relaxed">{line}</p>
      )}
      <button
        type="button"
        onClick={onEdit}
        className={[
          "mt-3 text-sm font-semibold text-[#C85C3C] underline underline-offset-4 hover:text-[#B14B2D]",
          FOCUS_RING,
        ].join(" ")}
      >
        Đổi địa chỉ
      </button>
    </div>
  );
}

export function ReviewStep({
  cartItems,
  cartCount,
  hasProducts,
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      {hasProducts && (
        <SectionCard
          title="Sản phẩm"
          icon={<Package size={16} />}
          aside={`${cartCount} sản phẩm`}
        >
          <ul className="divide-y divide-dashed divide-[#F0DDD5]">
            {cartItems.map((item, i) => (
              <li key={item._id || item.id || i} className="py-4 first:pt-0 last:pb-0">
                <CartLine item={item} />
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="Giao tới" icon={<MapPin size={16} />}>
        <AddressSummary addr={deliveryAddr} user={user} onEdit={onBack} />
      </SectionCard>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className={`${BTN_SECONDARY} flex-1`}>
          Quay lại
        </button>
        <button type="button" onClick={onNext} className={`${BTN_PRIMARY} flex-[2]`}>
          Tiếp tục thanh toán
        </button>
      </div>
    </motion.div>
  );
}
