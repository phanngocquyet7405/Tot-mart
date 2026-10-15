"use client";
export default function SubscriptionForm({ field, select, editing, form, change, productPicker, combos }) { return <>        {!editing && <label>Nguồn gói<select className="ml-2 rounded border p-2" value={form.sourceType} onChange={e => change('sourceType', e.target.value)}><option value="combo">Combo</option><option value="retail">Hàng lẻ</option></select></label>}
        {form.sourceType === 'retail' ? !editing && <>{productPicker}{field('stock', 'Số gói khả dụng', 'number')}{field('validTo', 'Ngày kết thúc nhận đăng ký', 'date')}</> : select('boxId', 'Combo', combos)}
        <label>Kỳ đăng ký<select className="ml-2 rounded border p-2" value={form.planType} onChange={e => change('planType', e.target.value)}>{[1,3,6,12].map(n => <option key={n} value={`${n}_month`}>{n} tháng</option>)}</select></label>{field('discountPercent', 'Giảm giá kỳ đăng ký (%)', 'number')}
</>; }
