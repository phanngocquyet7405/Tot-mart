/**
 * CheckoutStepper.js
 * Thanh bước: Địa chỉ → Kiểm tra → Thanh toán (đây là một chuỗi thật nên
 * dùng dấu mốc bước). Bước đã xong bấm để quay lại.
 */

import { MapPin, Package, CreditCard, Check } from "lucide-react";
import { STEPS } from "@/app/services/api/Checkoutpageservice";
import { FOCUS_RING } from "./checkoutStyles";

const ICONS = { MapPin, Package, CreditCard };

export function CheckoutStepper({ currentStep, onGoBack }) {
  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <ol className="flex items-start w-full max-w-lg mb-8" aria-label="Các bước thanh toán">
      {STEPS.map((s, i) => {
        const Icon = ICONS[s.icon];
        const isActive = s.id === currentStep;
        const isDone = i < stepIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <li
            key={s.id}
            className={["flex items-start", isLast ? "" : "flex-1"].join(" ")}
            aria-current={isActive ? "step" : undefined}
          >
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => isDone && onGoBack(s.id)}
                disabled={!isDone}
                aria-label={isDone ? `Quay lại bước ${s.label}` : s.label}
                className={[
                  "grid place-items-center w-10 h-10 rounded-full border transition-colors duration-200",
                  FOCUS_RING,
                  isActive
                    ? "bg-[#C85C3C] border-[#C85C3C] text-white"
                    : isDone
                      ? "bg-[#FFF0EB] border-[#C85C3C]/50 text-[#C85C3C] hover:bg-[#F0DDD5] cursor-pointer"
                      : "bg-white border-[#F0DDD5] text-stone-300 cursor-default",
                ].join(" ")}
              >
                {isDone ? <Check size={17} strokeWidth={2.5} /> : <Icon size={16} />}
              </button>
              <span
                className={[
                  "text-xs font-semibold",
                  isActive || isDone ? "text-[#2C1810]" : "text-stone-400",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={[
                  "flex-1 h-px mt-5 mx-3 transition-colors duration-300",
                  isDone ? "bg-[#C85C3C]/60" : "bg-[#F0DDD5]",
                ].join(" ")}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
