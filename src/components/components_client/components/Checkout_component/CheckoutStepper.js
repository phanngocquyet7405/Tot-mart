/**
 * CheckoutStepper.js
 * Thanh bước tiến (Step indicator) — 3 bước: Địa chỉ → Kiểm tra → Thanh toán
 */

import { MapPin, Package, CreditCard, CheckCircle2 } from "lucide-react";
import { STEPS } from "@/app/services/api/Checkoutpageservice";

const ICONS = { MapPin, Package, CreditCard };

export function CheckoutStepper({ currentStep, onGoBack }) {
  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center max-w-sm mb-10">
      {STEPS.map((s, i) => {
        const Icon = ICONS[s.icon];
        const isActive = s.id === currentStep;
        const isDone = i < stepIndex;

        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => isDone && onGoBack(s.id)}
                disabled={!isDone}
                className={[
                  "w-9 h-9 rounded-full flex items-center justify-center border font-black transition-all",
                  isActive
                    ? "bg-[#C85C3C] border-[#C85C3C] text-white shadow-lg shadow-[#C85C3C]/25"
                    : isDone
                      ? "bg-[#FFF0EB] border-[#C85C3C]/40 text-[#C85C3C] cursor-pointer hover:border-[#C85C3C]"
                      : "bg-stone-100 border-stone-200 text-stone-300 cursor-default",
                ].join(" ")}
              >
                {isDone ? <CheckCircle2 size={16} /> : <Icon size={15} />}
              </button>
              <span
                className={[
                  "text-[10px] font-bold uppercase tracking-wider",
                  isActive
                    ? "text-[#C85C3C]"
                    : isDone
                      ? "text-stone-400"
                      : "text-stone-300",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={[
                  "flex-1 h-px mx-2 mb-4 transition-colors",
                  isDone ? "bg-[#C85C3C]/30" : "bg-stone-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
