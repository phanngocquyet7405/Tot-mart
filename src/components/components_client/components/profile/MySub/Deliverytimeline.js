/**
 * DeliveryTimeline.js
 * Hiển thị tiến trình giao hàng dạng timeline dots
 */

"use client";

import { Check, Truck, Clock } from "lucide-react";
import { getDeliveryProgress } from "@/app/services/api/MySubscriptionService";

export function DeliveryTimeline({ totalDeliveries, remainDeliveries }) {
  if (!totalDeliveries) return null;

  const done = totalDeliveries - remainDeliveries;
  const progress = getDeliveryProgress(remainDeliveries, totalDeliveries);

  // Max 12 dots để giao diện gọn
  const displayCount = Math.min(totalDeliveries, 12);
  const dots = Array.from({ length: displayCount }, (_, i) => {
    const deliveryIndex = i + 1;
    // Scale nếu totalDeliveries > 12
    const scaledDone = Math.round((done / totalDeliveries) * displayCount);
    return deliveryIndex <= scaledDone
      ? "done"
      : deliveryIndex === scaledDone + 1
        ? "next"
        : "pending";
  });

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          Tiến độ giao hàng
        </span>
        <span className="text-[10px] font-bold text-stone-500">
          {done}/{totalDeliveries} lần
        </span>
      </div>

      <div className="relative">
        {/* Track */}
        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#C85C3C] to-[#E8835E] rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dot markers */}
        <div className="flex items-center justify-between mt-2 gap-0.5">
          {dots.map((status, i) => (
            <div
              key={i}
              className="flex-1 flex justify-center"
              title={`Lần ${i + 1}: ${status === "done" ? "Đã giao" : status === "next" ? "Tiếp theo" : "Chờ giao"}`}
            >
              {status === "done" ? (
                <div className="w-4 h-4 rounded-full bg-[#C85C3C] flex items-center justify-center">
                  <Check size={8} className="text-white" strokeWidth={3} />
                </div>
              ) : status === "next" ? (
                <div className="w-4 h-4 rounded-full bg-[#FFF0EB] border-2 border-[#C85C3C] flex items-center justify-center">
                  <Truck size={7} className="text-[#C85C3C]" />
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-stone-100 border border-stone-200 mt-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next delivery hint */}
      {remainDeliveries > 0 && (
        <div className="flex items-center gap-1.5 mt-1">
          <Clock size={10} className="text-stone-400" />
          <span className="text-[10px] text-stone-400">
            Còn{" "}
            <span className="font-bold text-stone-600">{remainDeliveries}</span>{" "}
            lần giao hàng
          </span>
        </div>
      )}
    </div>
  );
}
