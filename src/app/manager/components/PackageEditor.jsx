"use client";
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import ComboForm from './ComboForm';
import GiftForm from './GiftForm';
import SubscriptionForm from './SubscriptionForm';
import { ImageSelection } from './ProductsWorkspace';
import { ErrorPanel, FieldError } from './WorkspaceUI';
import { saveManagerForm } from '../services/managerApi';
import { managerError, money } from '../lib/productModel.mjs';
import { packageDraft, validatePackage, comboEstimate, giftEstimate, labels, fieldErrors } from '../lib/packageModel.mjs';

export default function PackageEditor({ kind, row, products, combos, onClose, onSaved, onDirtyChange }) {
  const [form,setForm]=useState(()=>packageDraft(row));
  const [files,setFiles]=useState([]), [errors,setErrors]=useState({}), [error,setError]=useState(''), [busy,setBusy]=useState(false);
  const [pickerQuery,setPickerQuery]=useState(''),[quantity,setQuantity]=useState(3);
  const dirty=useRef(false),locked=useRef(false);
  const editing=row?._id;
  function changed(key,value){dirty.current=true;onDirtyChange(true);setForm(previous=>({...previous,[key]:value}));setErrors(previous=>({...previous,[key]:undefined}));}
  function close(){if(!locked.current&&(!dirty.current||window.confirm('Bỏ các thay đổi chưa lưu?')))onClose();}
  const field=(key,label,type='text',required=true)=><div key={key} className={`grid gap-2 ${key==='description'?'sm:col-span-2':''}`}><label htmlFor={`package-${key}`} className="text-sm font-medium">{label}{required?' *':''}</label>{key==='description'?<textarea id={`package-${key}`} className="min-h-28 w-full rounded-lg border bg-background p-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form[key]} onChange={event=>changed(key,event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`package-error-${key}`:undefined} />:<Input id={`package-${key}`} type={type} min={type==='number'?0:undefined} step={key==='discountPercent'?'any':type==='number'?1:undefined} className="min-h-11 text-base" value={form[key]??''} onChange={event=>changed(key,event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`package-error-${key}`:undefined} />}<FieldError id={`package-error-${key}`} error={errors[key]} /></div>;
  const select=(key,label,items)=><div className="grid gap-2" key={key}><label htmlFor={`package-${key}`} className="text-sm font-medium">{label} *</label><select id={`package-${key}`} value={form[key]} onChange={event=>changed(key,event.target.value)} aria-invalid={!!errors[key]} className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"><option value="">Chọn {label.toLowerCase()}</option>{form[key]&&!items.some(item=>item._id===form[key])&&<option value={form[key]}>Nguồn hiện tại (không còn trong danh sách khả dụng)</option>}{items.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</select><FieldError error={errors[key]} /></div>;
  const filtered=products.filter(product=>product.name.toLocaleLowerCase('vi').includes(pickerQuery.toLocaleLowerCase('vi')));
  const productPicker=<fieldset className="grid gap-3 rounded-xl border p-4 sm:col-span-2"><legend className="px-1 text-sm font-semibold">Sản phẩm của cửa hàng</legend><Input aria-label="Tìm cấu phần" type="search" className="min-h-11" value={pickerQuery} onChange={event=>setPickerQuery(event.target.value)} placeholder="Tìm sản phẩm để chọn…" /><p className="text-xs text-muted-foreground">Đã chọn {form.products.length} cấu phần. Giá gói được BE xác định khi lưu.</p><div className="max-h-72 space-y-2 overflow-y-auto">{filtered.map(product=>{const item=form.products.find(part=>part.productId===product._id);return <div key={product._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 p-3"><label className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-sm"><input type="checkbox" checked={!!item} onChange={event=>changed('products',event.target.checked?[...form.products,{productId:product._id,quantity:1}]:form.products.filter(part=>part.productId!==product._id))} /><span className="min-w-0 break-words">{product.name}<span className="block text-xs text-muted-foreground">{money(product.price)}</span></span></label>{item&&<Input type="number" min={1} step={1} className="min-h-11 w-24" aria-label={`Số lượng ${product.name}`} value={item.quantity} onChange={event=>changed('products',form.products.map(part=>part.productId===product._id?{...part,quantity:event.target.value}:part))} />}</div>;})}{!filtered.length&&<p className="py-4 text-sm text-muted-foreground">Không có sản phẩm phù hợp. Hãy tạo sản phẩm trước nếu danh mục còn trống.</p>}</div><FieldError error={errors.products} />{form.products.some(part=>!products.some(product=>product._id===part.productId))&&<p role="alert" className="text-sm text-destructive">Có cấu phần không còn khả dụng. Hãy bỏ cấu phần đó trước khi lưu.</p>}{form.products.filter(part=>!products.some(product=>product._id===part.productId)).map(part=><Button type="button" variant="outline" key={part.productId} onClick={()=>changed('products',form.products.filter(item=>item.productId!==part.productId))}>Bỏ cấu phần không còn khả dụng</Button>)}</fieldset>;
  const sourceCombo=combos.find(combo=>combo._id===(kind==='gifts'?form.comboId:form.boxId));
  const combo=comboEstimate(form,products);
  const gift=giftEstimate(editing?row.value:sourceCombo?.value,form.bulkTiers,form.amenities,Number(quantity)||1);
  const monthlyValue=form.sourceType==='retail'?(editing?undefined:form.products.reduce((sum,part)=>sum+Number(products.find(p=>p._id===part.productId)?.price||0)*Number(part.quantity||0),0)):sourceCombo?.value;
  const termMonths=Number(form.planType.split('_')[0]);
  const prepaid=monthlyValue==null?null:Math.round(Number(monthlyValue)*termMonths*(1-Number(form.discountPercent||0)/100));
  async function save(event){
    event.preventDefault();if(locked.current)return;
    const next=validatePackage(kind,form,editing,products,combos);
    if(files.length>10||files.some(file=>file.size>5*1024*1024||!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)||!/\.(jpe?g|png|webp)$/i.test(file.name)))next.images='Tối đa 10 ảnh JPEG/PNG/WebP, mỗi ảnh không quá 5 MB.';
    setErrors(next);setError('');if(Object.keys(next).length){requestAnimationFrame(()=>document.getElementById(`package-${Object.keys(next)[0]}`)?.focus());return;}
    locked.current=true;setBusy(true);onDirtyChange(true,true);
    try{await saveManagerForm({tab:kind,form:{...form,name:form.name.trim()},editing,images:files});dirty.current=false;onDirtyChange(false);onSaved(`Đã ${editing?'lưu':'tạo'} ${labels[kind].toLocaleLowerCase('vi')}.`);}
    catch(failure){setErrors(fieldErrors(failure));setError(managerError(failure));}
    finally{locked.current=false;setBusy(false);onDirtyChange(dirty.current);}
  }
  return <Sheet open onOpenChange={open=>{if(!open)close();}}><SheetContent showCloseButton={false} className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl" onEscapeKeyDown={event=>{event.preventDefault();close();}}>
    <div className="border-b p-5"><SheetTitle className="text-xl">{editing?'Chỉnh sửa':'Tạo'} {labels[kind].toLocaleLowerCase('vi')}</SheetTitle><SheetDescription className="mt-2">{kind==='combos'?'Cấu phần, thời hạn và giá của combo.':kind==='gifts'?'Quà tặng từ combo, giảm theo lượng và tiện ích.':'Giao mỗi tháng, thu tiền trước cho cả kỳ.'}</SheetDescription></div>
    <form noValidate onSubmit={save} aria-busy={busy} className="flex min-h-0 flex-1 flex-col"><div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
      {error&&<ErrorPanel>{error}</ErrorPanel>}
      {editing&&kind==='combos'&&<p className="rounded-lg bg-muted p-3 text-sm">Phiên bản cấu phần: {row.definitionVersion??'BE chưa trả'}. BE có thể khóa sửa/xóa khi combo gắn với đơn hoặc đăng ký; lỗi 409 sẽ giữ nguyên biểu mẫu.</p>}
      {kind==='subscriptions'&&editing&&<p className="text-sm text-muted-foreground">Nguồn: {form.sourceType==='retail'?'Hàng lẻ (giữ nguyên cấu phần)':'Combo'}. Đây là mẫu gói; chỉnh sửa/xóa mẫu không có nghĩa hủy đăng ký đã bán hay hoàn tiền.</p>}
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">{field('name','Tên')}{kind!=='gifts'&&field('description','Mô tả','text',kind==='combos')}
        {kind==='combos'&&<ComboForm field={field} editing={editing} productPicker={productPicker} />}
        {kind==='gifts'&&<GiftForm field={field} select={select} editing={editing} form={form} change={changed} combos={combos} />}
        {kind==='subscriptions'&&<SubscriptionForm field={field} select={select} editing={editing} form={form} change={changed} productPicker={productPicker} combos={combos} />}
        {kind==='subscriptions'&&(editing||form.sourceType!=='retail')&&<label className="flex min-h-11 items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" checked={form.isActive} onChange={event=>changed('isActive',event.target.checked)} />Đang mở bán mẫu gói</label>}
      </fieldset>
      {Object.entries(errors).filter(([key])=>['bulkTiers','amenities','planType','sourceType','images'].includes(key)).map(([key,value])=><FieldError key={key} error={value} />)}
      {kind==='combos'&&<ImageSelection maxMB={5} disabled={busy} onChange={next=>{dirty.current=true;onDirtyChange(true);setFiles(next);}} />}
      {editing&&kind==='combos'&&(row.images||[]).length>0&&<p className="text-sm text-muted-foreground">Giữ {(row.images||[]).length} ảnh hiện tại; ảnh mới được thêm khi lưu.</p>}
      <section className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm tabular-nums" aria-label="Xem trước giá"><h3 className="font-semibold">Ước tính trước khi lưu</h3>
        {kind==='combos'?<><p>Giá cấu phần: {money(combo.base)}</p><p>Sau giảm combo: <strong>{money(combo.total)}</strong></p></>:kind==='gifts'?<><label className="flex flex-wrap items-center gap-3">Số gift xem trước<Input type="number" min={1} max={999} step={1} className="min-h-11 w-24" value={quantity} onChange={event=>setQuantity(Math.min(999,Math.max(1,Number(event.target.value)||1)))} /></label>{editing||sourceCombo?<><p>Tiền hàng: {money(gift.base)}</p><p>Giảm theo lượng: −{money(gift.discount)}</p><p>Tiện ích: +{money(gift.fee)}</p><p>Tổng ước tính: <strong>{money(gift.total)}</strong></p></>:<p>Chọn combo nguồn để xem ước tính.</p>}<p className="text-xs text-muted-foreground">Sau khi lưu, dùng “Báo giá BE” ở danh sách cho cấu hình đã lưu. Đây chưa phải số tiền thanh toán.</p></>:<><p>Tổng thu trước ước tính: <strong>{money(prepaid)}</strong></p><p>Bình quân mỗi tháng: {money(prepaid==null?null:Math.round(prepaid/termMonths))}</p>{form.sourceType==='retail'&&editing&&<p className="text-xs text-muted-foreground">BE không trả cấu phần hàng lẻ trong danh sách mẫu; xem giá đã lưu ở danh sách, không suy ngược thành giá thanh toán mới.</p>}</>}
        <p className="text-xs text-muted-foreground">Giá đã lưu và giá cuối cùng lấy từ BE; không tự ghi đè giá nguồn.</p>
      </section>
    </div><footer className="flex justify-end gap-3 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><Button type="button" variant="outline" className="min-h-11" disabled={busy} onClick={close}>Hủy</Button><Button className="min-h-11" disabled={busy}>{busy?'Đang lưu…':'Lưu'}</Button></footer></form>
  </SheetContent></Sheet>;
}
