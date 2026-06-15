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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Label section */}
      <div>
        <h3 className="text-sm font-medium text-foreground">
          Thời hạn hiệu lực
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Khoảng thời gian box được phép bán
        </p>
      </div>

      {/* Inputs */}
      <div className="md:col-span-2 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="validFrom">Ngày bắt đầu *</Label>
          <Input
            id="validFrom"
            type="date"
            min={today}
            value={form.validFrom}
            onChange={(e) => onChange("validFrom", e.target.value)}
          />
          {errors.validFrom && (
            <span className="text-xs text-red-500">{errors.validFrom}</span>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="validTo">Ngày kết thúc *</Label>
          <Input
            id="validTo"
            type="date"
            // FIX: Ngày kết thúc phải sau ngày bắt đầu (hoặc hôm nay nếu chưa chọn)
            min={form.validFrom || today}
            value={form.validTo}
            onChange={(e) => onChange("validTo", e.target.value)}
          />
          {errors.validTo && (
            <span className="text-xs text-red-500">{errors.validTo}</span>
          )}
        </div>
      </div>
    </div>
  );
}
