"use client";

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GiftForm({ field, select, editing, form, change, combos }) {
  return (
    <>
      {!editing && (
        <>
          {select('comboId', 'Combo nguồn', combos)}
          {field('stock', 'Số lượng gift khả dụng', 'number')}
        </>
      )}
      {field('validTo', 'Ngày kết thúc bán', 'date')}

      <p className="text-sm leading-relaxed text-muted-foreground sm:col-span-2">
        Gift giữ cấu phần và giá của combo tại thời điểm tạo. Phí tiện ích được tính gộp trong từng phần quà; không phải tùy chọn rời ở khâu thanh toán.
      </p>

      {/* Bậc giảm theo số lượng */}
      <fieldset className="space-y-3 rounded-xl border border-border bg-card p-4 sm:col-span-2">
        <legend className="px-1 text-sm font-semibold text-foreground">
          Giảm giá theo số lượng mua
        </legend>
        {form.bulkTiers.map((tier, index) => (
          <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Từ số lượng (gift)
              <Input
                type="number"
                min={2}
                max={999}
                step={1}
                className="min-h-11 text-base"
                value={tier.minQuantity}
                onChange={(event) =>
                  change(
                    'bulkTiers',
                    form.bulkTiers.map((item, i) =>
                      i === index ? { ...item, minQuantity: event.target.value } : item
                    )
                  )
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Giảm (%)
              <Input
                type="number"
                min={0}
                max={100}
                step="any"
                className="min-h-11 text-base"
                value={tier.percent}
                onChange={(event) =>
                  change(
                    'bulkTiers',
                    form.bulkTiers.map((item, i) =>
                      i === index ? { ...item, percent: event.target.value } : item
                    )
                  )
                }
              />
            </label>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-destructive/30 text-destructive-text hover:bg-destructive/10"
              onClick={() =>
                change(
                  'bulkTiers',
                  form.bulkTiers.filter((_, i) => i !== index)
                )
              }
            >
              <Trash2 className="size-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Bỏ bậc {index + 1}</span>
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={form.bulkTiers.length >= 10}
          onClick={() =>
            change('bulkTiers', [...form.bulkTiers, { minQuantity: '', percent: 0 }])
          }
        >
          <Plus className="mr-1.5 size-4" />
          Thêm bậc giảm giá
        </Button>
        <p className="text-xs text-muted-foreground">Tối đa 10 bậc, số lượng tối thiểu không trùng nhau.</p>
      </fieldset>

      {/* Tiện ích kèm phí */}
      <fieldset className="space-y-3 rounded-xl border border-border bg-card p-4 sm:col-span-2">
        <legend className="px-1 text-sm font-semibold text-foreground">
          Tiện ích kèm phí dịch vụ
        </legend>
        {form.amenities.map((amenity, index) => (
          <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Tên tiện ích
              <Input
                className="min-h-11 text-base"
                maxLength={100}
                value={amenity.name}
                placeholder="Ví dụ: Thiệp viết tay, Hộp quà lụa"
                onChange={(event) =>
                  change(
                    'amenities',
                    form.amenities.map((item, i) =>
                      i === index ? { ...item, name: event.target.value } : item
                    )
                  )
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              Phí mỗi gift (₫)
              <Input
                className="min-h-11 text-base"
                type="number"
                min={0}
                max={100000000}
                step={1}
                value={amenity.fee}
                onChange={(event) =>
                  change(
                    'amenities',
                    form.amenities.map((item, i) =>
                      i === index ? { ...item, fee: event.target.value } : item
                    )
                  )
                }
              />
            </label>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-destructive/30 text-destructive-text hover:bg-destructive/10"
              onClick={() =>
                change(
                  'amenities',
                  form.amenities.filter((_, i) => i !== index)
                )
              }
            >
              <Trash2 className="size-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Bỏ tiện ích {index + 1}</span>
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={form.amenities.length >= 10}
          onClick={() =>
            change('amenities', [...form.amenities, { name: '', fee: 0 }])
          }
        >
          <Plus className="mr-1.5 size-4" />
          Thêm tiện ích
        </Button>
      </fieldset>
    </>
  );
}
