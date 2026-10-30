/**
 * CheckoutStepper.js
 * Thanh bước: Địa chỉ → Kiểm tra → Thanh toán. Bước đã xong bấm để quay lại.
 * Chuẩn hóa màu sắc theo token hệ thống: primary, border, muted.
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
                  "grid place-items-center w-10 h-10 rounded-full border transition-colors duration-200 pointer-coarse:min-h-11 pointer-coarse:min-w-11",
                  FOCUS_RING,
                  isActive
                    ? "bg-primary border-primary text-primary-foreground shadow-xs"
                    : isDone
                      ? "bg-primary/10 border-primary/40 text-primary hover:bg-muted cursor-pointer"
                      : "bg-card border-border text-muted-foreground/60 cursor-default",
                ].join(" ")}
              >
                {isDone ? <Check size={17} strokeWidth={2.5} /> : <Icon size={16} />}
              </button>
              <span
                className={[
                  "text-xs font-semibold text-center",
                  isActive ? "text-primary font-bold" : isDone ? "text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={[
                  "flex-1 h-px mt-5 mx-3 transition-colors duration-300",
                  isDone ? "bg-primary/60" : "bg-border",
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
