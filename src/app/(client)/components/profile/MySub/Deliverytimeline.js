"use client";
/**
 * DeliveryTimeline.js
 * Hiển thị tiến trình giao hàng dạng timeline dots
 */

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
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Tiến độ giao nhận
        </span>
        <span className="text-[11px] font-bold text-foreground tabular-nums">
          Đã giao {done}/{totalDeliveries} đợt
        </span>
      </div>

      <div className="relative">
        {/* Track */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dot markers */}
        <div className="flex items-center justify-between mt-2.5 gap-1">
          {dots.map((status, i) => (
            <div
              key={i}
              className="flex-1 flex justify-center"
              title={`Đợt ${i + 1}: ${
                status === "done"
                  ? "Đã hoàn thành"
                  : status === "next"
                    ? "Đợt giao tiếp theo"
                    : "Chờ giao"
              }`}
            >
              {status === "done" ? (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-2xs">
                  <Check size={9} className="text-primary-foreground stroke-[3]" />
                </div>
              ) : status === "next" ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary bg-card flex items-center justify-center animate-pulse">
                  <Truck size={8} className="text-primary" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-muted border border-border flex items-center justify-center">
                  <Clock size={7} className="text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
