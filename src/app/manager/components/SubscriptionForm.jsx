"use client";

export default function SubscriptionForm({
  field,
  select,
  editing,
  form,
  change,
  productPicker,
  combos,
}) {
  return (
    <>
      {!editing && (
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Nguồn gói đăng ký
          <select
            className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.sourceType}
            onChange={(e) => change('sourceType', e.target.value)}
          >
            <option value="combo">Từ Combo có sẵn</option>
            <option value="retail">Từ Hàng lẻ (chọn cấu phần)</option>
          </select>
        </label>
      )}

      {form.sourceType === 'retail' ? (
        !editing && (
          <>
            {productPicker}
            {field('stock', 'Số gói khả dụng', 'number')}
            {field('validTo', 'Ngày kết thúc nhận đăng ký', 'date')}
          </>
        )
      ) : (
        select('boxId', 'Combo nguồn', combos)
      )}

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Kỳ hạn đăng ký
        <select
          className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={form.planType}
          onChange={(e) => change('planType', e.target.value)}
        >
          {[1, 3, 6, 12].map((n) => (
            <option key={n} value={`${n}_month`}>
              {n} tháng (giao mỗi tháng)
            </option>
          ))}
        </select>
      </label>

      {field('discountPercent', 'Mức giảm giá kỳ đăng ký (%)', 'number')}
    </>
  );
}
