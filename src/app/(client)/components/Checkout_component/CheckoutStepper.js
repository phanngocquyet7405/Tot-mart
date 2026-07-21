/**
 * CheckoutStepper.js
 * Thanh bước tiến (Step indicator) — 3 bước: Địa chỉ → Kiểm tra → Thanh toán
 * Palette: indigo-600 primary, slate-600 secondary
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
                  "w-9 h-9 rounded-full flex items-center justify-center border font-black transition-all duration-200",
                  isActive
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                    : isDone
                      ? "bg-indigo-50 border-indigo-600/40 text-indigo-600 cursor-pointer hover:border-indigo-600 hover:bg-indigo-100"
                      : "bg-slate-100 border-slate-200 text-slate-300 cursor-default",
                ].join(" ")}
              >
                {isDone ? <CheckCircle2 size={16} /> : <Icon size={15} />}
              </button>
              <span
                className={[
                  "text-[10px] font-bold uppercase tracking-wider transition-colors duration-200",
                  isActive
                    ? "text-indigo-600"
                    : isDone
                      ? "text-slate-600"
                      : "text-slate-400",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={[
                  "flex-1 h-px mx-2 mb-4 transition-colors duration-200",
                  isDone ? "bg-indigo-600/30" : "bg-slate-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
