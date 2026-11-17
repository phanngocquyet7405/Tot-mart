"use client";
/**
 * ReviewStep.js
 * Bước 2 — Kiểm tra đơn: Nhóm sản phẩm theo từng kiện / đối tác thương hiệu + địa chỉ đã chọn.
 * Chuẩn hóa màu sắc token, nút bấm cảm ứng >= 44px.
 */

import { useMemo } from "react";
import { cartLineKey } from "@/app/util/cartLine.mjs";
import { motion } from "framer-motion";
import { Package, MapPin, Store, Info } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { CartLine } from "./CartLine";
import { BTN_PRIMARY, BTN_SECONDARY, FOCUS_RING } from "./checkoutStyles";

function groupCartItemsByMerchant(cartItems = []) {
  const groupMap = new Map();

  for (const item of cartItems) {
    let key = "totmart-standard";
    let title = "TotMart Tuyển Chọn";
    let badge = "Kho TotMart";

    if (item.itemType === "box" || item.boxId) {
      key = "totmart-box";
      title = "Hộp quà TotMart Tuyển Chọn";
      badge = "Đóng hộp đặc biệt";
    } else {
      const brandName =
        typeof item.brand === "object" && item.brand?.name
          ? item.brand.name
          : typeof item.brand === "string" && item.brand.trim()
          ? item.brand.trim()
          : item.brandName || null;

      const merchantId = item.merchantId || item.merchant || null;

      if (brandName) {
        key = `brand-${brandName}`;
        title = brandName;
        badge = "Đối tác chính hãng";
      } else if (merchantId) {
        key = `merchant-${merchantId}`;
        title = `Nhà cung ứng #${String(merchantId).slice(-6)}`;
        badge = "Giao trực tiếp";
      }
    }

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        title,
        badge,
        items: [],
      });
    }
    groupMap.get(key).items.push(item);
  }

  return Array.from(groupMap.values());
}

function AddressSummary({ addr, user, onEdit }) {
  const line = [
    addr?.address || addr?.street,
    addr?.ward,
    addr?.district,
    addr?.city || addr?.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <p className="text-sm font-semibold text-foreground">
        {addr?.fullName || user?.name}
      </p>
      {addr?.phone && (
        <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">
          {addr.phone}
        </p>
      )}
      {line && (
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {line}
        </p>
      )}
      <button
        type="button"
        onClick={onEdit}
        className={[
          "mt-3 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors pointer-coarse:min-h-11",
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
  const packages = useMemo(
    () => groupCartItemsByMerchant(cartItems),
    [cartItems],
  );

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
          title="Sản phẩm & Kiện hàng"
          icon={<Package size={16} />}
          aside={`${cartCount} sản phẩm · ${packages.length} kiện`}
        >
          {packages.length > 1 && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
              <Info size={16} className="mt-0.5 shrink-0 text-primary" />
              <p className="leading-relaxed">
                Đơn hàng của bạn sẽ được tách thành{" "}
                <strong className="text-primary">{packages.length} kiện hàng riêng biệt</strong>{" "}
                do sản phẩm được bảo quản và đóng gói trực tiếp từ các đối tác / nhà vườn khác nhau.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {packages.map((pkg, pkgIndex) => (
              <div
                key={pkg.key}
                className="overflow-hidden rounded-xl border border-border bg-card/60"
              >
                {/* Package Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Store size={14} className="text-primary shrink-0" />
                    <span className="text-xs font-bold text-foreground">
                      {packages.length > 1
                        ? `Kiện ${pkgIndex + 1}: ${pkg.title}`
                        : pkg.title}
                    </span>
                    <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {pkg.badge}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {pkg.items.length} món
                  </span>
                </div>

                {/* Package Items */}
                <ul className="divide-y divide-dashed divide-border px-3.5 py-1">
                  {pkg.items.map((item) => (
                    <li
                      key={cartLineKey(item)}
                      className="py-3.5 first:pt-2 last:pb-2"
                    >
                      <CartLine item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Giao tới" icon={<MapPin size={16} />}>
        <AddressSummary addr={deliveryAddr} user={user} onEdit={onBack} />
      </SectionCard>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className={`${BTN_SECONDARY} flex-1`}
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={onNext}
          className={`${BTN_PRIMARY} flex-[2]`}
        >
          Tiếp tục thanh toán
        </button>
      </div>
    </motion.div>
  );
}
