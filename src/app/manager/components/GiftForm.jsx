"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function GiftForm({ field, select, editing, form, change, combos }) {
  return <>
    {!editing&&<>{select('comboId','Combo nguồn',combos)}{field('stock','Số gift khả dụng','number')}</>}{field('validTo','Ngày kết thúc bán','date')}
    <p className="text-sm leading-relaxed text-muted-foreground sm:col-span-2">Gift giữ cấu phần và giá combo tại lúc tạo. Phí tiện ích được tính trong mỗi hộp; không phải tùy chọn rời ở checkout.</p>
    <fieldset className="space-y-3 rounded-xl border p-4 sm:col-span-2"><legend className="px-1 text-sm font-semibold">Giảm theo số lượng</legend>
      {form.bulkTiers.map((tier,index)=><div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><label className="grid gap-1 text-sm">Từ số gift<Input type="number" min={2} max={999} step={1} className="min-h-11" value={tier.minQuantity} onChange={event=>change('bulkTiers',form.bulkTiers.map((item,i)=>i===index?{...item,minQuantity:event.target.value}:item))} /></label><label className="grid gap-1 text-sm">Giảm (%)<Input type="number" min={0} max={100} step="any" className="min-h-11" value={tier.percent} onChange={event=>change('bulkTiers',form.bulkTiers.map((item,i)=>i===index?{...item,percent:event.target.value}:item))} /></label><Button type="button" variant="outline" className="min-h-11 self-end" onClick={()=>change('bulkTiers',form.bulkTiers.filter((_,i)=>i!==index))}>Bỏ bậc {index+1}</Button></div>)}
      <Button type="button" variant="outline" className="min-h-11" disabled={form.bulkTiers.length>=10} onClick={()=>change('bulkTiers',[...form.bulkTiers,{minQuantity:'',percent:0}])}>Thêm bậc giảm</Button><p className="text-xs text-muted-foreground">Tối đa 10 bậc, số lượng không trùng.</p>
    </fieldset>
    <fieldset className="space-y-3 rounded-xl border p-4 sm:col-span-2"><legend className="px-1 text-sm font-semibold">Tiện ích kèm phí</legend>
      {form.amenities.map((amenity,index)=><div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><label className="grid gap-1 text-sm">Tên tiện ích<Input className="min-h-11" maxLength={100} value={amenity.name} onChange={event=>change('amenities',form.amenities.map((item,i)=>i===index?{...item,name:event.target.value}:item))} /></label><label className="grid gap-1 text-sm">Phí mỗi gift (₫)<Input className="min-h-11" type="number" min={0} max={100000000} step={1} value={amenity.fee} onChange={event=>change('amenities',form.amenities.map((item,i)=>i===index?{...item,fee:event.target.value}:item))} /></label><Button type="button" variant="outline" className="min-h-11 self-end" onClick={()=>change('amenities',form.amenities.filter((_,i)=>i!==index))}>Bỏ tiện ích {index+1}</Button></div>)}
      <Button type="button" variant="outline" className="min-h-11" disabled={form.amenities.length>=10} onClick={()=>change('amenities',[...form.amenities,{name:'',fee:0}])}>Thêm tiện ích</Button>
    </fieldset>
  </>;
}
