/**
 * OrderSummary.js
 * Cột phải — Tóm tắt đơn hàng (sticky sidebar)
 * Hiển thị danh sách items rút gọn + breakdown chi phí
 * Palette: indigo-600 primary, slate colors, rose-600 for discount/alert
 */

import { Package, Truck } from "lucide-react";
import { SectionCard } from "./SectionCard";

const fmt = (n) => (n ?? 0).toLocaleString("vi-VN");

// ─── Cost row ─────────────────────────────────────────────────────────────────
function CostRow({ label, value, highlight, strike, icon }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={`flex items-center gap-1 ${highlight === "rose" ? "text-rose-600" : highlight === "emerald" ? "text-emerald-600" : "text-slate-600"}`}>
        {icon}
        {label}
      </span>
      <span
        className={[
          "font-bold",
          strike ? "line-through text-slate-300" : "",
          highlight === "rose" ? "text-rose-600" : highlight === "emerald" ? "text-emerald-600" : "text-slate-900",
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
  hasProducts,
  cartTotal,
  shippingFee,
  discount,
  finalTotal,
}) {
  return (
    <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <SectionCard title="Tóm tắt đơn hàng" icon={<Package size={16} />}>

        {/* Sản phẩm thường */}
        {hasProducts && (
          <div className="space-y-2 pb-3 border-b border-slate-200">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">
              Sản phẩm
            </p>
            {cartItems.slice(0, 3).map((item, i) => (
              <div key={item._id || i} className="flex justify-between items-center gap-2">
                <span className="text-xs text-slate-700 line-clamp-1 flex-1">
                  {item.name}{" "}
                  <span className="text-slate-500">x{item.quantity}</span>
                </span>
                <span className="text-xs font-bold text-slate-900 shrink-0">
                  {fmt(item.price * item.quantity)}₫
                </span>
              </div>
            ))}
            {cartItems.length > 3 && (
              <p className="text-xs text-slate-600">
                +{cartItems.length - 3} sản phẩm khác
              </p>
            )}
          </div>
        )}

        {/* Cost breakdown */}
        <div className="space-y-2.5 pt-3">
          {hasProducts && (
            <CostRow label="Sản phẩm" value={`${fmt(cartTotal)}₫`} />
          )}
          {discount > 0 && (
            <CostRow
              label="Giảm giá"
              value={`-${fmt(discount)}₫`}
              highlight="rose"
            />
          )}
          <CostRow
            label="Vận chuyển"
            value={shippingFee === 0 ? "Miễn phí" : `${fmt(shippingFee)}₫`}
            highlight={shippingFee === 0 ? "emerald" : null}
            icon={<Truck size={12} />}
          />
          {shippingFee > 0 && (
            <p className="text-[10px] text-slate-600 pl-4">
              Miễn phí ship cho đơn sản phẩm từ 500.000₫
            </p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-3">
          <span className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Tổng cộng
          </span>
          <span className="text-2xl font-black text-indigo-600">
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
          <div key={text} className="flex items-center gap-2 text-slate-600">
            <span className="text-base">{icon}</span>
            <span className="text-xs">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
