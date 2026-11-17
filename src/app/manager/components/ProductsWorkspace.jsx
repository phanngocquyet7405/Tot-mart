"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ImageIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Warehouse,
  X,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import WorkspacePageHeader from '@/components/workspace/WorkspacePageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductForm from './ProductForm';
import {
  listManagerProducts,
  getManagerCatalogOptions,
  saveManagerForm,
  adjustManagerProductStock,
  deleteManagerProduct,
  deleteManagerResource,
  adjustManagerPackageStock,
} from '../services/managerApi';
import {
  managerError,
  money,
  productDraft,
  validateProduct,
  validateProductImages,
  validStockAdjustment,
} from '../lib/productModel.mjs';
import { fieldErrors } from '../lib/packageModel.mjs';
import { ErrorPanel, Pagination, ItemThumbnail } from './WorkspaceUI';

const ProductImage = ItemThumbnail;

export function ImageSelection({ onChange, disabled, maxMB = 2 }) {
  const [previews, setPreviews] = useState([]);
  const urls = useRef([]);

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function choose(files) {
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    urls.current = next.map((item) => item.url);
    setPreviews(next);
    onChange(files);
  }

  return (
    <div className="grid gap-3">
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Thêm ảnh mới
        <input
          id="product-images"
          disabled={disabled}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="block w-full rounded-lg border border-border bg-background p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
          onChange={(event) => choose(Array.from(event.target.files || []))}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        Tối đa 10 ảnh JPEG, PNG hoặc WebP mỗi lần lưu, tối đa {maxMB} MB/ảnh. Ảnh mới được gửi khi lưu.
      </p>
      {previews.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map(({ file, url }, index) => (
            <li key={`${file.name}-${index}`} className="min-w-0 rounded-lg border border-border p-2">
              <Image
                unoptimized
                width={160}
                height={160}
                src={url}
                alt={`Ảnh mới: ${file.name}`}
                className="aspect-square w-full rounded-md object-cover"
              />
              <p className="mt-2 truncate text-xs text-muted-foreground">{file.name}</p>
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                className="mt-1 min-h-11 w-full text-xs text-destructive-text hover:bg-destructive/10"
                onClick={() =>
                  choose(previews.filter((_, i) => i !== index).map((item) => item.file))
                }
              >
                Bỏ ảnh<span className="sr-only"> {file.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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

  function markDirty() {
    dirty.current = true;
    onDirtyChange(true);
  }

  function close() {
    if (locked.current) return;
    if (!dirty.current || window.confirm('Bỏ các thay đổi chưa lưu?')) onClose();
  }

  function change(key, value) {
    markDirty();
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  async function submit(event) {
    event.preventDefault();
    if (locked.current) return;
    const next = validateProduct(form, options, editing);
    const imageError = validateProductImages(files);
    if (imageError) next.images = imageError;
    setErrors(next);
    setError('');
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        document.getElementById(`product-${Object.keys(next)[0]}`)?.focus()
      );
      return;
    }
    locked.current = true;
    setSaving(true);
    onDirtyChange(true, true);
    try {
      await saveManagerForm({
        tab: 'products',
        form: { ...form, name: form.name.trim(), description: form.description.trim() },
        editing,
        images: files,
      });
      dirty.current = false;
      onDirtyChange(false);
      onSaved(editing ? 'Đã lưu sản phẩm.' : 'Đã tạo sản phẩm.');
    } catch (failure) {
      setErrors(fieldErrors(failure));
      setError(managerError(failure, 'Không thể lưu sản phẩm. Vui lòng thử lại.'));
    } finally {
      locked.current = false;
      setSaving(false);
      onDirtyChange(dirty.current);
    }
  }

  const field = (key, label, type = 'text', required = true) => (
    <div className="grid gap-2" key={key}>
      <label htmlFor={`product-${key}`} className="text-sm font-medium text-foreground">
        {label}
        {required && ' *'}
      </label>
      {key === 'description' ? (
        <textarea
          id={`product-${key}`}
          aria-required={required}
          value={form[key]}
          onChange={(event) => change(key, event.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `error-${key}` : undefined}
          className="min-h-28 w-full rounded-lg border border-border bg-background p-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <Input
          id={`product-${key}`}
          aria-required={required}
          type={type}
          min={type === 'number' ? 0 : undefined}
          step={type === 'number' ? 1 : undefined}
          value={form[key]}
          onChange={(event) => change(key, event.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `error-${key}` : undefined}
          className="min-h-11 text-base"
        />
      )}
      {errors[key] && (
        <p id={`error-${key}`} className="text-sm font-medium text-destructive-text">
          {errors[key]}
        </p>
      )}
    </div>
  );

  const select = (key, label, items) => (
    <div className="grid gap-2" key={key}>
      <label htmlFor={`product-${key}`} className="text-sm font-medium text-foreground">
        {label} *
      </label>
      <select
        id={`product-${key}`}
        aria-required="true"
        value={form[key]}
        onChange={(event) => change(key, event.target.value)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `error-${key}` : undefined}
        className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Chọn {label.toLowerCase()}</option>
        {items.map((item) => (
          <option key={item._id} value={item._id}>
            {item.name}
          </option>
        ))}
      </select>
      {errors[key] && (
        <p id={`error-${key}`} className="text-sm font-medium text-destructive-text">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl"
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          close();
        }}
      >
        {/* Header Sheet */}
        <div className="flex items-start justify-between gap-3 border-b border-border bg-card p-5 sm:p-6">
          <div>
            <SheetTitle className="text-xl font-bold text-foreground">
              {editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm text-muted-foreground">
              Thông tin và hình ảnh sản phẩm thuộc cửa hàng của bạn. Dấu * là bắt buộc.
            </SheetDescription>
          </div>
          <Button
            type="button"
            aria-label="Đóng biểu mẫu"
            variant="ghost"
            className="size-11 shrink-0"
            disabled={saving}
            onClick={close}
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Nội dung form dài chia nhóm */}
        <form
          noValidate
          onSubmit={submit}
          className="flex min-h-0 flex-1 flex-col"
          aria-busy={saving}
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
            {error && <ErrorPanel>{error}</ErrorPanel>}
            {!options.categories.length && (
              <p role="alert" className="text-sm font-medium text-destructive-text">
                Chưa có danh mục được phép. Vui lòng liên hệ quản trị viên.
              </p>
            )}

            {/* Nhóm 1: Thông tin cơ bản */}
            <fieldset
              disabled={saving}
              className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <legend className="px-2 text-sm font-semibold text-foreground">
                1. Thông tin cơ bản
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">{field('name', 'Tên sản phẩm')}</div>
                <div className="sm:col-span-2">{field('description', 'Mô tả chi tiết')}</div>
                <ProductForm field={field} select={select} editing={editing} options={options} />
              </div>
            </fieldset>

            {/* Nhóm 2: Tồn kho & giá */}
            <fieldset
              disabled={saving}
              className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <legend className="px-2 text-sm font-semibold text-foreground">
                2. Thông tin tồn kho
              </legend>
              {editing ? (
                <div className="rounded-lg bg-muted/60 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tồn kho hiện tại:</span>
                    <span className="text-base font-bold tabular-nums text-foreground">
                      {product.stock ?? 'Chưa có dữ liệu'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tồn kho được cập nhật nguyên tử qua nút &ldquo;Điều chỉnh tồn kho&rdquo; trong danh sách nhằm tránh ghi đè dữ liệu.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Số lượng tồn kho ban đầu được thiết lập ở mục Thông tin cơ bản bên trên.
                </p>
              )}
            </fieldset>

            {/* Nhóm 3: Hình ảnh sản phẩm */}
            <fieldset
              disabled={saving}
              className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <legend className="px-2 text-sm font-semibold text-foreground">
                3. Hình ảnh sản phẩm
              </legend>
              {(product?.images || []).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Ảnh hiện có trên hệ thống:</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {product.images.map((image, i) => (
                      <ProductImage
                        key={`${image?.url || image}-${i}`}
                        image={image}
                        name={`Ảnh hiện tại ${i + 1}`}
                        className="size-16"
                      />
                    ))}
                  </div>
                </div>
              )}
              <ImageSelection
                disabled={saving}
                onChange={(next) => {
                  markDirty();
                  setFiles(next);
                }}
              />
              {errors.images && (
                <p role="alert" className="text-sm font-medium text-destructive-text">
                  {errors.images}
                </p>
              )}
            </fieldset>
          </div>

          {/* Thanh lưu cố định ở đáy (Sticky Bottom Action Bar) */}
          <footer className="sticky bottom-0 z-10 flex shrink-0 justify-end gap-3 border-t border-border bg-background/95 p-4 backdrop-blur-xs pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={saving}
              onClick={close}
            >
              Hủy
            </Button>
            <Button className="min-h-11" disabled={saving || !ready}>
              {saving ? 'Đang lưu…' : 'Lưu sản phẩm'}
            </Button>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function ProductActionDialog({ action, onClose, onDone, resource = 'products' }) {
  const { kind, product } = action;
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  const removing = kind === 'delete';
  const itemLabel =
    resource === 'products'
      ? 'sản phẩm'
      : resource === 'subscriptions'
      ? 'gói đăng ký'
      : resource === 'gifts'
      ? 'gift'
      : 'combo';
  const valid = validStockAdjustment(delta, product.stock, reason);

  async function confirm(event) {
    event.preventDefault();
    if (locked.current || (!removing && !valid)) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      if (removing)
        await (resource === 'products'
          ? deleteManagerProduct(product._id)
          : deleteManagerResource(resource, product._id));
      else
        await (resource === 'products'
          ? adjustManagerProductStock(product._id, Number(delta), reason.trim())
          : adjustManagerPackageStock(
              resource,
              product._id,
              Number(delta),
              reason.trim()
            ));
      onDone(removing ? `Đã xóa ${itemLabel}.` : 'Đã điều chỉnh tồn kho.');
    } catch (failure) {
      setError(managerError(failure, 'Thao tác chưa thành công. Vui lòng thử lại.'));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !locked.current) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
        onEscapeKeyDown={(event) => {
          if (locked.current) event.preventDefault();
        }}
      >
        <DialogTitle className="text-lg font-bold text-foreground">
          {removing ? `Xóa ${itemLabel}?` : 'Điều chỉnh tồn kho'}
        </DialogTitle>
        <DialogDescription className="break-words text-sm text-muted-foreground">
          {product.name}
          {removing
            ? ' sẽ được xóa khỏi hệ thống nếu không gắn với ràng buộc dữ liệu nào.'
            : ` · Tồn hiện tại: ${product.stock ?? 'Chưa có dữ liệu'}`}
        </DialogDescription>
        <form onSubmit={confirm} className="grid gap-4" aria-busy={busy}>
          {error && <ErrorPanel>{error}</ErrorPanel>}
          {!removing && (
            <>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Mức tăng/giảm số lượng
                <Input
                  autoFocus
                  type="number"
                  step="1"
                  value={delta}
                  disabled={busy}
                  onChange={(event) => setDelta(event.target.value)}
                  placeholder="Ví dụ: 10 hoặc -2"
                  className="min-h-11 text-base"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                {valid
                  ? `Tồn sau điều chỉnh (dự kiến): ${Number(product.stock) + Number(delta)}`
                  : 'Nhập số nguyên khác 0 trong khoảng ±1.000.000; tồn sau điều chỉnh không âm, lý do tối đa 200 ký tự.'}
              </p>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Lý do điều chỉnh (không bắt buộc, tối đa 200 ký tự)
                <Input
                  maxLength={200}
                  value={reason}
                  disabled={busy}
                  onChange={(event) => setReason(event.target.value)}
                  className="min-h-11 text-base"
                />
              </label>
            </>
          )}
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant={removing ? 'destructive' : 'default'}
              className="min-h-11"
              disabled={busy || (!removing && !valid)}
            >
              {busy ? 'Đang xử lý…' : removing ? `Xóa ${itemLabel}` : 'Lưu điều chỉnh'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function stockBadge(stock) {
  if (stock === 0) {
    return <Badge variant="destructive">Hết hàng</Badge>;
  }
  if (stock == null) {
    return <Badge variant="outline">Chưa có tồn</Badge>;
  }
  if (stock <= 5) {
    return <Badge variant="warning">Tồn: {stock}</Badge>;
  }
  return <Badge variant="secondary">Tồn: {stock}</Badge>;
}

export default function ProductsWorkspace({ onDirtyChange }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState({ keyword: '', page: 1 });
  const [draftFilters, setDraftFilters] = useState({
    brand: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });
  const [filterError, setFilterError] = useState('');
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
    const timer = setTimeout(
      () =>
        setFilter((previous) =>
          previous.keyword === query.trim() ? previous : { ...previous, keyword: query.trim(), page: 1 }
        ),
      300
    );
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    listManagerProducts({ ...filter, signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(response.data))
          throw new Error('Dữ liệu sản phẩm trả về không đúng định dạng.');
        const pages = Math.max(1, Number(response.pagination?.totalPages) || 1);
        if (filter.page > pages) {
          setFilter((previous) => ({ ...previous, page: pages }));
          return;
        }
        setResult({ rows: response.data, pages, key: listKey, error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setResult({ rows: [], pages: 1, key: listKey, error: managerError(error) });
      });
    return () => controller.abort();
  }, [filter, listKey]);

  useEffect(() => {
    const controller = new AbortController();
    getManagerCatalogOptions({ signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        if (
          !Array.isArray(response.data?.brands) ||
          !Array.isArray(response.data?.categories)
        )
          throw new Error('Danh sách thương hiệu/danh mục trả về không đúng định dạng.');
        setCatalog({ options: response.data, error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setCatalog({ options: null, error: managerError(error) });
      });
    return () => controller.abort();
  }, [catalogVersion]);

  function closeEditor() {
    setEditor(null);
    onDirtyChange(false);
  }

  function mutationDone(message) {
    closeEditor();
    setAction(null);
    setNotice(message);
    toast.success(message);
    setVersion((previous) => previous + 1);
  }

  function openEditor(product) {
    setNotice('');
    setEditor({ product });
  }

  function applyFilters(event) {
    event.preventDefault();
    setFilterError('');
    const { minPrice, maxPrice } = draftFilters;
    if (
      [minPrice, maxPrice].some(
        (value) =>
          value !== '' && (!Number.isSafeInteger(Number(value)) || Number(value) < 0)
      ) ||
      (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice))
    ) {
      setFilterError('Khoảng giá phải là số nguyên không âm, giá tối thiểu không lớn hơn tối đa.');
      return;
    }
    setFilter((previous) => ({
      ...previous,
      ...Object.fromEntries(
        Object.entries(draftFilters).map(([key, value]) => [
          key,
          value === '' ? undefined : value,
        ])
      ),
      page: 1,
    }));
  }

  function resetFilters() {
    setQuery('');
    setDraftFilters({ brand: '', category: '', minPrice: '', maxPrice: '' });
    setFilter({ keyword: '', page: 1 });
    setFilterError('');
  }

  const hasFilters = Boolean(
    filter.keyword ||
      filter.brand ||
      filter.category ||
      filter.minPrice !== undefined ||
      filter.maxPrice !== undefined
  );
  const rows = result.rows;

  return (
    <section aria-labelledby="products-heading" className="space-y-6">
      <WorkspacePageHeader
        id="products-heading"
        title="Sản phẩm"
        description="Quản lý danh mục và tồn kho của cửa hàng."
        actions={
          <Button
            className="min-h-11"
            disabled={!catalog.options}
            onClick={() => openEditor(null)}
          >
            <Plus className="size-4" />
            Thêm sản phẩm
          </Button>
        }
      />

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success-text"
        >
          {notice}
        </p>
      )}

      {catalog.error ? (
        <ErrorPanel
          onRetry={() => {
            setCatalog({ options: null, error: '' });
            setCatalogVersion((previous) => previous + 1);
          }}
        >
          Không tải được thương hiệu và danh mục: {catalog.error}
        </ErrorPanel>
      ) : !catalog.options ? (
        <p role="status" className="text-sm text-muted-foreground">
          Đang tải danh mục và thương hiệu…
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Tìm kiếm nhanh */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-4 sm:p-5">
          <label className="grid w-full gap-2 text-sm font-medium text-foreground sm:max-w-md">
            Tìm kiếm sản phẩm
            <span className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                className="min-h-11 pl-9 text-base"
                placeholder="Nhập tên sản phẩm để tìm…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </span>
          </label>
          <p className="text-xs text-muted-foreground">Chỉ hiển thị sản phẩm của cửa hàng</p>
        </div>

        {/* Bộ lọc mở rộng */}
        <details className="border-b border-border px-4 py-3 sm:px-5">
          <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-foreground">
            Bộ lọc nâng cao (Thương hiệu, Danh mục, Giá)
            {hasFilters && (
              <Badge variant="secondary" className="ml-2">
                Đang lọc
              </Badge>
            )}
          </summary>
          <form
            onSubmit={applyFilters}
            className="grid gap-3 pb-3 pt-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {['brand', 'category'].map((key) => (
              <label key={key} className="grid gap-1.5 text-sm font-medium text-foreground">
                {key === 'brand' ? 'Thương hiệu' : 'Danh mục'}
                <select
                  className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  disabled={!catalog.options}
                  value={draftFilters[key]}
                  onChange={(event) =>
                    setDraftFilters((previous) => ({
                      ...previous,
                      [key]: event.target.value,
                    }))
                  }
                >
                  <option value="">Tất cả</option>
                  {(
                    catalog.options?.[key === 'brand' ? 'brands' : 'categories'] || []
                  ).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {['minPrice', 'maxPrice'].map((key) => (
              <label key={key} className="grid gap-1.5 text-sm font-medium text-foreground">
                {key === 'minPrice' ? 'Giá từ (₫)' : 'Giá đến (₫)'}
                <Input
                  type="number"
                  min={0}
                  step={1}
                  className="min-h-11 text-base"
                  value={draftFilters[key]}
                  onChange={(event) =>
                    setDraftFilters((previous) => ({
                      ...previous,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
            {filterError && (
              <p
                role="alert"
                className="text-sm font-medium text-destructive-text sm:col-span-2 xl:col-span-4"
              >
                {filterError}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1 sm:col-span-2 xl:col-span-4">
              <Button type="submit" className="min-h-11">
                Áp dụng bộ lọc
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={resetFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </form>
        </details>

        {/* Danh sách dữ liệu đủ 5 trạng thái */}
        <div aria-busy={loading}>
          {loading ? (
            <div role="status" className="grid gap-3 p-5">
              <span className="sr-only">Đang tải danh sách sản phẩm…</span>
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : result.error ? (
            <div className="p-4">
              <ErrorPanel onRetry={() => setVersion((previous) => previous + 1)}>
                {notice
                  ? 'Thao tác đã thành công, nhưng chưa tải lại được danh sách. '
                  : ''}
                {result.error}
              </ErrorPanel>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Package}
                title={hasFilters ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm'}
                description={
                  hasFilters
                    ? 'Thử thay đổi từ khóa hoặc điều chỉnh khoảng giá/bộ lọc.'
                    : 'Thêm sản phẩm đầu tiên để bắt đầu tạo các gói combo và bán hàng.'
                }
                action={
                  <Button
                    variant="outline"
                    className="min-h-11"
                    disabled={!hasFilters && !catalog.options}
                    onClick={() => (hasFilters ? resetFilters() : openEditor(null))}
                  >
                    {hasFilters ? 'Xóa bộ lọc' : 'Thêm sản phẩm'}
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop Table (>= 768px) */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Sản phẩm</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead className="text-right">Giá bán</TableHead>
                      <TableHead className="text-right">Tồn kho</TableHead>
                      <TableHead className="w-16">
                        <span className="sr-only">Thao tác</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((product) => {
                      const brandName =
                        product.brand?.name ||
                        catalog.options?.brands.find(
                          (item) => item._id === product.brand
                        )?.name ||
                        'Chưa có thương hiệu';
                      const categoryName =
                        product.category?.name ||
                        catalog.options?.categories.find(
                          (item) => item._id === product.category
                        )?.name ||
                        'Chưa có danh mục';

                      return (
                        <TableRow key={product._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <ProductImage
                                key={
                                  product.images?.[0]?.url ||
                                  product.images?.[0] ||
                                  product._id
                                }
                                image={product.images?.[0]}
                                name={product.name}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">
                                  {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{brandName}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {categoryName}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums text-foreground">
                            {money(product.price)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {stockBadge(product.stock)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-label={`Thao tác với ${product.name}`}
                                  variant="ghost"
                                  className="size-11"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  disabled={!catalog.options}
                                  onSelect={() => openEditor(product)}
                                  className="min-h-11"
                                >
                                  <Pencil className="mr-2 size-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setNotice('');
                                    setAction({ kind: 'stock', product });
                                  }}
                                  className="min-h-11"
                                >
                                  <Warehouse className="mr-2 size-4" />
                                  Điều chỉnh tồn kho
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setNotice('');
                                    setAction({ kind: 'delete', product });
                                  }}
                                  className="min-h-11 text-destructive-text"
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Xóa sản phẩm
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View (< 768px, vùng chạm >= 44px) */}
              <div className="divide-y divide-border md:hidden">
                {rows.map((product) => {
                  const brandName =
                    product.brand?.name ||
                    catalog.options?.brands.find(
                      (item) => item._id === product.brand
                    )?.name ||
                    'Chưa có thương hiệu';
                  const categoryName =
                    product.category?.name ||
                    catalog.options?.categories.find(
                      (item) => item._id === product.category
                    )?.name ||
                    'Chưa có danh mục';

                  return (
                    <article key={product._id} className="space-y-3 p-4">
                      <div className="flex items-start gap-3">
                        <ProductImage
                          key={
                            product.images?.[0]?.url ||
                            product.images?.[0] ||
                            product._id
                          }
                          image={product.images?.[0]}
                          name={product.name}
                          className="size-14"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words font-semibold text-foreground">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{brandName}</p>
                          <p className="text-xs text-muted-foreground">{categoryName}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5 text-sm">
                        <span className="font-semibold tabular-nums text-foreground">
                          {money(product.price)}
                        </span>
                        {stockBadge(product.stock)}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-11 flex-1 text-xs"
                          disabled={!catalog.options}
                          onClick={() => openEditor(product)}
                        >
                          <Pencil className="mr-1.5 size-3.5" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-11 flex-1 text-xs"
                          onClick={() => {
                            setNotice('');
                            setAction({ kind: 'stock', product });
                          }}
                        >
                          <Warehouse className="mr-1.5 size-3.5" />
                          Tồn kho
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-11 text-xs text-destructive-text border-destructive/30 hover:bg-destructive/10"
                          onClick={() => {
                            setNotice('');
                            setAction({ kind: 'delete', product });
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Phân trang */}
        {!result.error && (
          <div className="p-4 border-t border-border">
            <Pagination
              page={filter.page}
              pages={result.pages}
              disabled={loading}
              onChange={(nextPage) =>
                setFilter((previous) => ({ ...previous, page: nextPage }))
              }
            />
          </div>
        )}
      </div>

      {editor && catalog.options && (
        <ProductEditor
          product={editor.product}
          options={catalog.options}
          onClose={closeEditor}
          onSaved={mutationDone}
          onDirtyChange={onDirtyChange}
        />
      )}

      {action && (
        <ProductActionDialog
          action={action}
          onClose={() => setAction(null)}
          onDone={mutationDone}
        />
      )}
    </section>
  );
}
