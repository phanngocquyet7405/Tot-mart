"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ValiditySection
 *
 * Props:
 *  - form: { validFrom, validTo }
 *  - errors: { validFrom?, validTo? }
 *  - onChange(field, value)
 */
export function ValiditySection({ form, errors, onChange }) {
  // FIX: Giới hạn không cho chọn ngày trong quá khứ
  const today = new Date().toISOString().split("T")[0];

  const inputClass =
    "border-border bg-card text-[var(--foreground)] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-[hsl(var(--primary))]/30";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Label section */}
      <div>
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          Thời hạn hiệu lực
        </h3>
        <p className="text-xs text-[var(--foreground)]/50 mt-1">
          Khoảng thời gian box được phép bán
        </p>
      </div>

      {/* Inputs */}
      <div className="md:col-span-2 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="validFrom" className="text-[var(--foreground)]/80">
            Ngày bắt đầu *
          </Label>
          <Input
            id="validFrom"
            type="date"
            min={today}
            value={form.validFrom}
            onChange={(e) => onChange("validFrom", e.target.value)}
            className={inputClass}
          />
          {errors.validFrom && (
            <span className="text-xs text-destructive-text">{errors.validFrom}</span>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="validTo" className="text-[var(--foreground)]/80">
            Ngày kết thúc *
          </Label>
          <Input
            id="validTo"
            type="date"
            // FIX: Ngày kết thúc phải sau ngày bắt đầu (hoặc hôm nay nếu chưa chọn)
            min={form.validFrom || today}
            value={form.validTo}
            onChange={(e) => onChange("validTo", e.target.value)}
            className={inputClass}
          />
          {errors.validTo && (
            <span className="text-xs text-destructive-text">{errors.validTo}</span>
          )}
        </div>
      </div>
    </div>
  );
}
