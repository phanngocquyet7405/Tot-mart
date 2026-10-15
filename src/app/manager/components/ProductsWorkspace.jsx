"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ImageIcon, MoreHorizontal, Pencil, Plus, Search, Trash2, Warehouse, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ProductForm from './ProductForm';
import { listManagerProducts, getManagerCatalogOptions, saveManagerForm, adjustManagerProductStock, deleteManagerProduct, deleteManagerResource, adjustManagerPackageStock } from '../services/managerApi';
import { managerError, money, productDraft, validateProduct, validateProductImages, validStockAdjustment } from '../lib/productModel.mjs';
import { fieldErrors } from '../lib/packageModel.mjs';

function ErrorMessage({ children, onRetry }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"><p className="text-destructive">{children}</p>{onRetry && <Button variant="outline" className="min-h-11" onClick={onRetry}><RefreshCw />Thử lại</Button>}</div>;
}

function ProductImage({ image, name, className = 'size-12' }) {
  const [failed, setFailed] = useState(false);
  const url = typeof image === 'string' ? image : image?.url;
  return <div className={`${className} grid shrink-0 place-items-center overflow-hidden rounded-lg bg-muted`}>
    {url && !failed ? <Image unoptimized width={80} height={80} src={url} alt={name || ''} onError={() => setFailed(true)} className="size-full object-cover" /> : <ImageIcon aria-hidden="true" className="size-5 text-muted-foreground" />}
  </div>;
}

export function ImageSelection({ onChange, disabled, maxMB = 2 }) {
  const [previews, setPreviews] = useState([]);
  const urls = useRef([]);
  useEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), []);
  function choose(files) {
    urls.current.forEach(url => URL.revokeObjectURL(url));
    const next = files.map(file => ({ file, url: URL.createObjectURL(file) }));
    urls.current = next.map(item => item.url); setPreviews(next); onChange(files);
  }
  return <div className="grid gap-3">
    <label className="grid gap-2 text-sm font-medium">Thêm ảnh sản phẩm
      <input id="product-images" disabled={disabled} type="file" accept="image/jpeg,image/png,image/webp" multiple className="block w-full rounded-lg border p-3 text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:p-2" onChange={event => choose(Array.from(event.target.files || []))} />
    </label>
    <p className="text-xs text-muted-foreground">Tối đa 10 ảnh JPEG, PNG hoặc WebP mỗi lần lưu, tối đa {maxMB} MB/ảnh. Ảnh mới được gửi khi lưu.</p>
    {previews.length > 0 && <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{previews.map(({ file, url }, index) => <li key={`${file.name}-${index}`} className="min-w-0 rounded-lg border p-2">
      <Image unoptimized width={160} height={160} src={url} alt={`Ảnh mới: ${file.name}`} className="aspect-square w-full rounded object-cover" /><p className="mt-2 truncate text-xs">{file.name}</p>
      <Button type="button" variant="ghost" disabled={disabled} className="mt-1 min-h-11 w-full" onClick={() => choose(previews.filter((_, i) => i !== index).map(item => item.file))}>Bỏ ảnh<span className="sr-only"> {file.name}</span></Button>
    </li>)}</ul>}
  </div>;
}

function ProductEditor({ product, options, onClose, onSaved, onDirtyChange }) {
  const [form, setForm] = useState(() => productDraft(product));
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const locked = useRef(false);
  const dirty = useRef(false);
  const editing = product?._id;
  const ready = options.brands.length > 0 && options.categories.length > 0;
  function markDirty() { dirty.current = true; onDirtyChange(true); }
  function close() {
    if (locked.current) return;
    if (!dirty.current || window.confirm('Bỏ các thay đổi chưa lưu?')) onClose();
  }
  useEffect(() => {
    function beforeUnload(event) { if (dirty.current || locked.current) event.preventDefault(); }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);
  function change(key, value) {
    markDirty(); setForm(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: undefined }));
  }
  async function submit(event) {
    event.preventDefault();
    if (locked.current) return;
    const next = validateProduct(form, options, editing);
    const imageError = validateProductImages(files);
    if (imageError) next.images = imageError;
    setErrors(next); setError('');
    if (Object.keys(next).length) {
      requestAnimationFrame(() => document.getElementById(`product-${Object.keys(next)[0]}`)?.focus());
      return;
    }
    locked.current = true; setSaving(true);
    try {
      await saveManagerForm({ tab: 'products', form: { ...form, name: form.name.trim(), description: form.description.trim() }, editing, images: files });
      dirty.current = false; onDirtyChange(false); onSaved(editing ? 'Đã lưu sản phẩm.' : 'Đã tạo sản phẩm.');
    } catch (failure) { setErrors(fieldErrors(failure)); setError(managerError(failure, 'Không thể lưu sản phẩm. Vui lòng thử lại.')); }
    finally { locked.current = false; setSaving(false); }
  }
  const field = (key, label, type = 'text', required = true) => <div className="grid gap-2" key={key}>
    <label htmlFor={`product-${key}`} className="text-sm font-medium">{label}{required && ' *'}</label>
    {key === 'description' ? <textarea id={`product-${key}`} aria-required={required} value={form[key]} onChange={event => change(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} className="min-h-28 w-full rounded-lg border bg-background p-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring" /> :
      <Input id={`product-${key}`} aria-required={required} type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 1 : undefined} value={form[key]} onChange={event => change(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} className="min-h-11 text-base" />}
    {errors[key] && <p id={`error-${key}`} className="text-sm text-destructive">{errors[key]}</p>}
  </div>;
  const select = (key, label, items) => <div className="grid gap-2" key={key}>
    <label htmlFor={`product-${key}`} className="text-sm font-medium">{label} *</label>
    <select id={`product-${key}`} aria-required="true" value={form[key]} onChange={event => change(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} className="min-h-11 w-full rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <option value="">Chọn {label.toLowerCase()}</option>{items.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
    </select>{errors[key] && <p id={`error-${key}`} className="text-sm text-destructive">{errors[key]}</p>}
  </div>;
  return <Sheet open onOpenChange={open => { if (!open) close(); }}>
    <SheetContent showCloseButton={false} className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl" onEscapeKeyDown={event => { event.preventDefault(); close(); }}>
      <div className="flex items-start justify-between gap-3 border-b p-5 sm:p-6"><div><SheetTitle className="text-xl">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</SheetTitle><SheetDescription className="mt-2">Thông tin và ảnh sản phẩm của cửa hàng. * là bắt buộc.</SheetDescription></div><Button type="button" aria-label="Đóng biểu mẫu" variant="ghost" className="size-11" disabled={saving} onClick={close}><X /></Button></div>
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col" aria-busy={saving}>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {!options.categories.length && <p role="alert" className="text-sm text-destructive">Chưa có danh mục được phép. Vui lòng liên hệ admin.</p>}
          <fieldset disabled={saving} className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">{field('name', 'Tên sản phẩm')}</div><div className="sm:col-span-2">{field('description', 'Mô tả')}</div>
            <ProductForm field={field} select={select} editing={editing} options={options} />
          </fieldset>
          {editing && <p className="text-sm text-muted-foreground">Tồn hiện tại: {product.stock ?? 'Chưa có dữ liệu'}. Dùng “Điều chỉnh tồn kho” trong danh sách để thay đổi.</p>}
          {(product?.images || []).length > 0 && <section aria-label="Ảnh hiện tại"><h3 className="mb-3 text-sm font-medium">Ảnh hiện tại</h3><div className="flex flex-wrap gap-3">{product.images.map((image, i) => <ProductImage key={`${image?.url || image}-${i}`} image={image} name={`Ảnh hiện tại ${i + 1}`} className="size-20" />)}</div></section>}
          <ImageSelection disabled={saving} onChange={next => { markDirty(); setFiles(next); }} />
          {errors.images && <p role="alert" className="text-sm text-destructive">{errors.images}</p>}
        </div>
        <footer className="flex shrink-0 justify-end gap-3 border-t bg-popover p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><Button type="button" variant="outline" className="min-h-11" disabled={saving} onClick={close}>Hủy</Button><Button className="min-h-11" disabled={saving || !ready}>{saving ? 'Đang lưu…' : 'Lưu sản phẩm'}</Button></footer>
      </form>
    </SheetContent>
  </Sheet>;
}

export function ProductActionDialog({ action, onClose, onDone, resource = 'products' }) {
  const { kind, product } = action;
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  const removing = kind === 'delete';
  const itemLabel = resource === 'products' ? 'sản phẩm' : resource === 'subscriptions' ? 'gói đăng ký' : resource === 'gifts' ? 'gift' : 'combo';
  const valid = validStockAdjustment(delta, product.stock, reason);
  async function confirm(event) {
    event.preventDefault();
    if (locked.current || (!removing && !valid)) return;
    locked.current = true; setBusy(true); setError('');
    try {
      if (removing) await (resource === 'products' ? deleteManagerProduct(product._id) : deleteManagerResource(resource, product._id));
      else await (resource === 'products' ? adjustManagerProductStock(product._id, Number(delta), reason.trim()) : adjustManagerPackageStock(resource, product._id, Number(delta), reason.trim()));
      onDone(removing ? `Đã xóa ${itemLabel}.` : 'Đã điều chỉnh tồn kho.');
    } catch (failure) { setError(managerError(failure, 'Thao tác chưa thành công. Vui lòng thử lại.')); }
    finally { locked.current = false; setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !locked.current) onClose(); }}><DialogContent showCloseButton={false} className="max-h-[90dvh] overflow-y-auto sm:max-w-md" onEscapeKeyDown={event => { if (locked.current) event.preventDefault(); }}>
    <DialogTitle>{removing ? `Xóa ${itemLabel}?` : 'Điều chỉnh tồn kho'}</DialogTitle>
    <DialogDescription className="break-words">{product.name}{removing ? ' sẽ được xóa nếu hệ thống cho phép. Hãy kiểm tra trước khi xác nhận.' : ` · Tồn hiện tại: ${product.stock ?? 'Chưa có dữ liệu'}`}</DialogDescription>
    <form onSubmit={confirm} className="grid gap-4" aria-busy={busy}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!removing && <><label className="grid gap-2 text-sm font-medium">Mức tăng/giảm<Input autoFocus type="number" step="1" value={delta} disabled={busy} onChange={event => setDelta(event.target.value)} placeholder="Ví dụ: 10 hoặc -2" className="min-h-11 text-base" /></label>
        <p className="text-sm text-muted-foreground">{valid ? `Tồn sau điều chỉnh (dự kiến): ${Number(product.stock) + Number(delta)}` : 'Nhập số nguyên khác 0 trong khoảng ±1.000.000; tồn sau điều chỉnh không âm, lý do tối đa 200 ký tự.'}</p>
        <label className="grid gap-2 text-sm font-medium">Lý do (không bắt buộc, tối đa 200 ký tự)<Input maxLength={200} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} className="min-h-11 text-base" /></label></>}
      <DialogFooter><Button type="button" variant="outline" className="min-h-11" disabled={busy} onClick={onClose}>Hủy</Button><Button type="submit" variant={removing ? 'destructive' : 'default'} className="min-h-11" disabled={busy || (!removing && !valid)}>{busy ? 'Đang xử lý…' : removing ? `Xóa ${itemLabel}` : 'Lưu điều chỉnh'}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}

export default function ProductsWorkspace({ onDirtyChange }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState({ keyword: '', page: 1 });
  const [draftFilters,setDraftFilters] = useState({brand:'',category:'',minPrice:'',maxPrice:''});
  const [filterError,setFilterError] = useState('');
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ rows: [], pages: 1, key: '', error: '' });
  const [catalog, setCatalog] = useState({ options: null, error: '' });
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [editor, setEditor] = useState(null);
  const [action, setAction] = useState(null);
  const [notice, setNotice] = useState('');
  const listKey = JSON.stringify([filter, version]);
  const loading = result.key !== listKey;
  useEffect(() => {
    const timer = setTimeout(() => setFilter(previous => previous.keyword === query.trim() ? previous : { ...previous, keyword: query.trim(), page: 1 }), 300);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const controller = new AbortController();
    listManagerProducts({ ...filter, signal: controller.signal }).then(response => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(response.data)) throw new Error('Dữ liệu sản phẩm trả về không đúng định dạng.');
      const pages = Math.max(1, Number(response.pagination?.totalPages) || 1);
      if (filter.page > pages) { setFilter(previous => ({ ...previous, page: pages })); return; }
      setResult({ rows: response.data, pages, key: listKey, error: '' });
    }).catch(error => { if (!controller.signal.aborted) setResult({ rows: [], pages: 1, key: listKey, error: managerError(error) }); });
    return () => controller.abort();
  }, [filter, listKey]);
  useEffect(() => {
    const controller = new AbortController();
    getManagerCatalogOptions({ signal: controller.signal }).then(response => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(response.data?.brands) || !Array.isArray(response.data?.categories)) throw new Error('Danh sách thương hiệu/danh mục trả về không đúng định dạng.');
      setCatalog({ options: response.data, error: '' });
    }).catch(error => { if (!controller.signal.aborted) setCatalog({ options: null, error: managerError(error) }); });
    return () => controller.abort();
  }, [catalogVersion]);
  function closeEditor() { setEditor(null); onDirtyChange(false); }
  function mutationDone(message) {
    closeEditor(); setAction(null); setNotice(message); toast.success(message); setVersion(previous => previous + 1);
  }
  function openEditor(product) { setNotice(''); setEditor({ product }); }
  function applyFilters(event){
    event.preventDefault();setFilterError('');
    const {minPrice,maxPrice}=draftFilters;
    if([minPrice,maxPrice].some(value=>value!==''&&(!Number.isSafeInteger(Number(value))||Number(value)<0))||(minPrice!==''&&maxPrice!==''&&Number(minPrice)>Number(maxPrice))){setFilterError('Khoảng giá phải là số nguyên không âm, giá tối thiểu không lớn hơn tối đa.');return;}
    setFilter(previous=>({...previous,...Object.fromEntries(Object.entries(draftFilters).map(([key,value])=>[key,value===''?undefined:value])),page:1}));
  }
  function resetFilters(){setQuery('');setDraftFilters({brand:'',category:'',minPrice:'',maxPrice:''});setFilter({keyword:'',page:1});setFilterError('');}
  const hasFilters=!!(filter.keyword||filter.brand||filter.category||filter.minPrice!==undefined||filter.maxPrice!==undefined);
  const rows = result.rows;
  return <section aria-labelledby="products-heading" className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 id="products-heading" className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Sản phẩm</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">Quản lý danh mục và tồn kho của cửa hàng.</p></div><Button className="min-h-11" disabled={!catalog.options} onClick={() => openEditor(null)}><Plus />Thêm sản phẩm</Button></div>
    {notice && <p role="status" className="rounded-lg border bg-card px-4 py-3 text-sm">{notice}</p>}
    {catalog.error ? <ErrorMessage onRetry={() => { setCatalog({ options: null, error: '' }); setCatalogVersion(previous => previous + 1); }}>Không tải được thương hiệu và danh mục: {catalog.error}</ErrorMessage> : !catalog.options ? <p role="status" className="text-sm text-muted-foreground">Đang tải thương hiệu và danh mục…</p> : null}
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b p-4 sm:p-5">
        <label className="grid w-full gap-2 text-sm font-medium sm:max-w-md">Tìm sản phẩm
          <span className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" aria-hidden="true" /><Input type="search" className="min-h-11 pl-9 text-base" placeholder="Nhập tên sản phẩm…" value={query} onChange={event => setQuery(event.target.value)} /></span>
        </label><p className="text-xs text-muted-foreground">Dữ liệu thuộc cửa hàng của bạn</p>
      </div>
      <details className="border-b px-4 py-3 sm:px-5"><summary className="min-h-11 cursor-pointer content-center text-sm font-medium">Bộ lọc thương hiệu, danh mục và giá{hasFilters?' · Đang lọc':''}</summary><form onSubmit={applyFilters} className="grid gap-3 pb-3 pt-2 sm:grid-cols-2 xl:grid-cols-4">
        {['brand','category'].map(key=><label key={key} className="grid gap-2 text-sm">{key==='brand'?'Thương hiệu':'Danh mục'}<select className="min-h-11 w-full rounded-lg border bg-background px-3" disabled={!catalog.options} value={draftFilters[key]} onChange={event=>setDraftFilters(previous=>({...previous,[key]:event.target.value}))}><option value="">Tất cả</option>{(catalog.options?.[key==='brand'?'brands':'categories']||[]).map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</select></label>)}
        {['minPrice','maxPrice'].map(key=><label key={key} className="grid gap-2 text-sm">{key==='minPrice'?'Giá từ (₫)':'Giá đến (₫)'}<Input type="number" min={0} step={1} className="min-h-11" value={draftFilters[key]} onChange={event=>setDraftFilters(previous=>({...previous,[key]:event.target.value}))} /></label>)}
        {filterError&&<p role="alert" className="text-sm text-destructive sm:col-span-2 xl:col-span-4">{filterError}</p>}<div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-4"><Button className="min-h-11">Áp dụng bộ lọc</Button><Button type="button" variant="outline" className="min-h-11" onClick={resetFilters}>Xóa bộ lọc</Button></div>
      </form></details>
      <div aria-busy={loading}>
        {loading ? <div role="status" className="grid gap-4 p-5"><span className="sr-only">Đang tải sản phẩm…</span>{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : result.error ? <div className="p-4"><ErrorMessage onRetry={() => setVersion(previous => previous + 1)}>{notice ? 'Thao tác đã thành công, nhưng chưa tải lại được danh sách. ' : ''}{result.error}</ErrorMessage></div> : rows.length === 0 ?
          <div className="px-4 py-16 text-center"><h2 className="font-semibold">{hasFilters ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm'}</h2><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{hasFilters ? 'Thử từ khóa khác hoặc xóa bộ lọc.' : 'Thêm sản phẩm đầu tiên để bắt đầu xây dựng danh mục cửa hàng.'}</p><Button variant="outline" className="mt-5 min-h-11" disabled={!hasFilters && !catalog.options} onClick={() => hasFilters ? resetFilters() : openEditor(null)}>{hasFilters ? 'Xóa bộ lọc' : 'Thêm sản phẩm'}</Button></div> :
          <table className="block w-full text-sm md:table"><thead className="hidden border-b text-left text-muted-foreground md:table-header-group"><tr><th scope="col" className="px-5 py-3 font-medium">Sản phẩm</th><th scope="col" className="px-4 py-3 font-medium">Danh mục</th><th scope="col" className="px-4 py-3 text-right font-medium">Giá bán</th><th scope="col" className="px-4 py-3 text-right font-medium">Tồn kho</th><th scope="col" className="px-4 py-3"><span className="sr-only">Thao tác</span></th></tr></thead>
            <tbody className="block divide-y md:table-row-group">{rows.map(product => <tr key={product._id} className="relative grid grid-cols-2 gap-3 p-4 md:table-row md:p-0">
              <td className="col-span-2 min-w-0 pr-12 md:max-w-sm md:px-5 md:py-4"><div className="flex min-w-0 items-center gap-3"><ProductImage key={product.images?.[0]?.url || product.images?.[0] || product._id} image={product.images?.[0]} /><div className="min-w-0"><p className="break-words font-medium">{product.name}</p><p className="mt-1 break-words text-xs text-muted-foreground">{product.brand?.name || catalog.options?.brands.find(item => item._id === product.brand)?.name || 'Chưa có thương hiệu'}</p><p className="mt-1 text-xs text-muted-foreground md:hidden">{product.category?.name || catalog.options?.categories.find(item => item._id === product.category)?.name || 'Chưa có danh mục'}</p></div></div></td>
              <td className="hidden px-4 py-4 text-muted-foreground md:table-cell">{product.category?.name || catalog.options?.categories.find(item => item._id === product.category)?.name || 'Chưa có danh mục'}</td>
              <td className="tabular-nums md:px-4 md:py-4 md:text-right"><span className="mr-2 text-xs text-muted-foreground md:hidden">Giá</span>{money(product.price)}</td>
              <td className="text-right tabular-nums md:px-4 md:py-4"><Badge variant={product.stock === 0 ? 'destructive' : 'secondary'}>{product.stock === 0 ? 'Hết hàng' : product.stock == null ? 'Chưa có tồn' : `Tồn: ${product.stock}`}</Badge></td>
              <td className="absolute right-2 top-4 md:static md:px-4 md:py-4 md:text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button aria-label={`Thao tác với ${product.name}`} variant="ghost" className="size-11"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem disabled={!catalog.options} onSelect={() => openEditor(product)} className="min-h-11"><Pencil />Chỉnh sửa</DropdownMenuItem><DropdownMenuItem onSelect={() => { setNotice(''); setAction({ kind: 'stock', product }); }} className="min-h-11"><Warehouse />Điều chỉnh tồn kho</DropdownMenuItem><DropdownMenuItem onSelect={() => { setNotice(''); setAction({ kind: 'delete', product }); }} className="min-h-11 text-destructive"><Trash2 />Xóa sản phẩm</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
            </tr>)}</tbody></table>}
      </div>
      {!result.error && <nav aria-label="Phân trang sản phẩm" className="flex flex-wrap items-center justify-between gap-3 border-t p-4"><p aria-live="polite" className="text-sm tabular-nums text-muted-foreground">Trang {filter.page} / {result.pages}</p><div className="flex gap-2"><Button variant="outline" className="min-h-11" disabled={loading || filter.page <= 1} onClick={() => setFilter(previous => ({ ...previous, page: previous.page - 1 }))}>Trang trước</Button><Button variant="outline" className="min-h-11" disabled={loading || filter.page >= result.pages} onClick={() => setFilter(previous => ({ ...previous, page: previous.page + 1 }))}>Trang sau</Button></div></nav>}
    </div>
    {editor && catalog.options && <ProductEditor product={editor.product} options={catalog.options} onClose={closeEditor} onSaved={mutationDone} onDirtyChange={onDirtyChange} />}
    {action && <ProductActionDialog action={action} onClose={() => setAction(null)} onDone={mutationDone} />}
  </section>;
}
