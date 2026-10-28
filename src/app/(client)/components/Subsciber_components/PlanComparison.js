"use client";
import { useId } from 'react';
import { formatCurrency } from '@/app/util/formatter';

// Both the catalog card and the purchasing modal read the same API totals.
export default function PlanComparison({ plans = [], selectedId, onSelect }) {
  const groupId = useId();
  const periods = { '1_month': 1, '3_month': 3, '6_month': 6, '12_month': 12 };
  const available = plans.filter(plan => plan._id && plan.isActive !== false && periods[plan.planType]
    && Number.isSafeInteger(plan.discountPrice ?? plan.basePrice) && (plan.discountPrice ?? plan.basePrice) > 0);
  if (!available.length) return <p role="status" className="tm-plan-help">Chưa có kỳ hạn khả dụng cho hộp này.</p>;
  return <fieldset className="tm-plan-comparison">
    <legend>{onSelect ? 'Chọn kỳ hạn nhận hộp' : 'So sánh kỳ hạn'}</legend>
    <div className="flex justify-between gap-3 text-sm text-muted-foreground"><span>Kỳ hạn</span><span>Tổng trả trước</span></div>
    {available.map(plan => {
      const months = periods[plan.planType];
      const total = plan.discountPrice ?? plan.basePrice;
      const selected = plan._id === selectedId;
      const Tag = onSelect ? 'label' : 'div';
      return <Tag key={plan._id} className={`tm-plan-row ${onSelect ? 'tm-plan-row--selectable' : ''} ${selected ? 'tm-plan-row--selected' : ''}`}>
        <span className="tm-plan-row__term">
          {onSelect && <input type="radio" name={groupId} value={plan._id} checked={selected} onChange={() => onSelect(plan)} />}
          <span>{months} tháng</span>
        </span>
        <span className="tm-plan-row__amount"><span className="sr-only">Tổng trả trước: </span>{formatCurrency(total)}</span>
        <span className="tm-plan-row__average">Bình quân {formatCurrency(Math.round(total / months))}/tháng</span>
      </Tag>;
    })}
    <p className="tm-plan-help">Giá trên là tổng trả trước cho cả kỳ. Phí giao hàng trả riêng theo từng lần nhận.</p>
  </fieldset>;
}
