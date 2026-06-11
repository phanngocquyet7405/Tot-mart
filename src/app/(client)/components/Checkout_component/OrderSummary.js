/**
 * OrderSummary.js
 * Cột phải — Tóm tắt đơn hàng (sticky sidebar)
 * Hiển thị danh sách items rút gọn + breakdown chi phí
 */

import { Package, Truck } from "lucide-react";
import { SectionCard } from "./SectionCard";

const fmt = (n) => (n ?? 0).toLocaleString("vi-VN");

// ─── Cost row ─────────────────────────────────────────────────────────────────
function CostRow({ label, value, highlight, strike, icon }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={`flex items-center gap-1 ${highlight === "red" ? "text-[#C85C3C]" : highlight === "green" ? "text-emerald-600" : "text-stone-500"}`}>
        {icon}
        {label}
      </span>
      <span
        className={[
          "font-bold",
          strike ? "line-through text-stone-300" : "",
          highlight === "red" ? "text-[#C85C3C]" : highlight === "green" ? "text-emerald-600" : "text-[#2C1810]",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function OrderSummary({
  cartItems,
  subscribeItems,
  hasProducts,
  hasSubscribes,
  cartTotal,
  subscribeTotal,
  shippingFee,
  discount,
  finalTotal,
}) {
  return (
    <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <SectionCard title="Tóm tắt đơn hàng" icon={<Package size={16} />}>

        {/* Sản phẩm thường */}
        {hasProducts && (
          <div className="space-y-2 pb-3 border-b border-[#F0DDD5]">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-2">
              Sản phẩm
            </p>
            {cartItems.slice(0, 3).map((item, i) => (
              <div key={item._id || i} className="flex justify-between items-center gap-2">
                <span className="text-xs text-stone-500 line-clamp-1 flex-1">
                  {item.name}{" "}
                  <span className="text-stone-400">x{item.quantity}</span>
                </span>
                <span className="text-xs font-bold text-[#2C1810] shrink-0">
                  {fmt(item.price * item.quantity)}₫
                </span>
              </div>
            ))}
            {cartItems.length > 3 && (
              <p className="text-xs text-stone-400">
                +{cartItems.length - 3} sản phẩm khác
              </p>
            )}
          </div>
        )}

        {/* Subscribe */}
        {hasSubscribes && (
          <div className="space-y-2 py-3 border-b border-[#F0DDD5]">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-2">
              Subscribe
            </p>
            {subscribeItems.map((sub) => (
              <div key={sub.key} className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-stone-500 line-clamp-1 block">
                    {sub.boxName}
                  </span>
                  <span className="text-[10px] text-stone-400">{sub.planLabel}</span>
                </div>
                <span className="text-xs font-bold text-[#2C1810] shrink-0">
                  {fmt(sub.totalPrice)}₫
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Cost breakdown */}
        <div className="space-y-2.5 pt-3">
          {hasProducts && (
            <CostRow label="Sản phẩm" value={`${fmt(cartTotal)}₫`} />
          )}
          {hasSubscribes && (
            <CostRow label="Subscribe" value={`${fmt(subscribeTotal)}₫`} />
          )}
          {discount > 0 && (
            <CostRow
              label="Giảm giá"
              value={`-${fmt(discount)}₫`}
              highlight="green"
            />
          )}
          <CostRow
            label="Vận chuyển"
            value={shippingFee === 0 ? "Miễn phí" : `${fmt(shippingFee)}₫`}
            highlight={shippingFee === 0 ? "green" : null}
            icon={<Truck size={12} />}
          />
          {shippingFee > 0 && (
            <p className="text-[10px] text-stone-400 pl-4">
              Miễn phí ship cho đơn sản phẩm từ 500.000₫
            </p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t border-[#F0DDD5] mt-3">
          <span className="text-sm font-black text-[#2C1810] uppercase tracking-wider">
            Tổng cộng
          </span>
          <span className="text-2xl font-black text-[#C85C3C]">
            {fmt(finalTotal)}₫
          </span>
        </div>
      </SectionCard>

      {/* Trust badges */}
      <div className="space-y-2 px-1">
        {[
          { icon: "🚚", text: "Giao hàng trong 2–5 ngày" },
          { icon: "🔄", text: "Đổi trả miễn phí trong 7 ngày" },
          { icon: "🎁", text: "Đóng gói quà tặng miễn phí" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-stone-400">
            <span className="text-base">{icon}</span>
            <span className="text-xs">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
