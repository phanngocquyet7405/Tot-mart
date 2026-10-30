"use client";

import { useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
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
import {
  packageDraft,
  validatePackage,
  comboEstimate,
  giftEstimate,
  labels,
  fieldErrors,
} from '../lib/packageModel.mjs';

export default function PackageEditor({
  kind,
  row,
  products,
  combos,
  onClose,
  onSaved,
  onDirtyChange,
}) {
  const [form, setForm] = useState(() => packageDraft(row));
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [quantity, setQuantity] = useState(3);
  const dirty = useRef(false);
  const locked = useRef(false);
  const editing = row?._id;

  function changed(key, value) {
    dirty.current = true;
    onDirtyChange(true);
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function close() {
    if (!locked.current && (!dirty.current || window.confirm('Bỏ các thay đổi chưa lưu?'))) {
      onClose();
    }
  }

  const field = (key, label, type = 'text', required = true) => (
    <div key={key} className={`grid gap-2 ${key === 'description' ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={`package-${key}`} className="text-sm font-medium text-foreground">
        {label}
        {required ? ' *' : ''}
      </label>
      {key === 'description' ? (
        <textarea
          id={`package-${key}`}
          className="min-h-28 w-full rounded-lg border border-border bg-background p-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={form[key]}
          onChange={(event) => changed(key, event.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `package-error-${key}` : undefined}
        />
      ) : (
        <Input
          id={`package-${key}`}
          type={type}
          min={type === 'number' ? 0 : undefined}
          step={key === 'discountPercent' ? 'any' : type === 'number' ? 1 : undefined}
          className="min-h-11 text-base"
          value={form[key] ?? ''}
          onChange={(event) => changed(key, event.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `package-error-${key}` : undefined}
        />
      )}
      <FieldError id={`package-error-${key}`} error={errors[key]} />
    </div>
  );

  const select = (key, label, items) => (
    <div className="grid gap-2" key={key}>
      <label htmlFor={`package-${key}`} className="text-sm font-medium text-foreground">
        {label} *
      </label>
      <select
        id={`package-${key}`}
        value={form[key]}
        onChange={(event) => changed(key, event.target.value)}
        aria-invalid={!!errors[key]}
        className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Chọn {label.toLowerCase()}</option>
        {form[key] && !items.some((item) => item._id === form[key]) && (
          <option value={form[key]}>Nguồn hiện tại (không còn trong danh sách khả dụng)</option>
        )}
        {items.map((item) => (
          <option key={item._id} value={item._id}>
            {item.name}
          </option>
        ))}
      </select>
      <FieldError error={errors[key]} />
    </div>
  );

  const filtered = products.filter((product) =>
    product.name.toLocaleLowerCase('vi').includes(pickerQuery.toLocaleLowerCase('vi'))
  );

  const productPicker = (
    <fieldset className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:col-span-2">
      <legend className="px-1 text-sm font-semibold text-foreground">
        Chọn cấu phần từ sản phẩm của cửa hàng
      </legend>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
        <Input
          aria-label="Tìm cấu phần"
          type="search"
          className="min-h-11 pl-9 text-base"
          value={pickerQuery}
          onChange={(event) => setPickerQuery(event.target.value)}
          placeholder="Tìm sản phẩm để chọn…"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Đã chọn {form.products.length} sản phẩm cấu phần. Giá chính xác được BE xác định khi lưu.
      </p>
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {filtered.map((product) => {
          const item = form.products.find((part) => part.productId === product._id);
          return (
            <div
              key={product._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3"
            >
              <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="size-5 rounded border-border"
                  checked={!!item}
                  onChange={(event) =>
                    changed(
                      'products',
                      event.target.checked
                        ? [...form.products, { productId: product._id, quantity: 1 }]
                        : form.products.filter((part) => part.productId !== product._id)
                    )
                  }
                />
                <span className="min-w-0 break-words font-medium text-foreground">
                  {product.name}
                  <span className="block text-xs font-normal text-muted-foreground">
                    Đơn giá: {money(product.price)}
                  </span>
                </span>
              </label>
              {item && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Số lượng:</span>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    className="min-h-11 w-24 text-base"
                    aria-label={`Số lượng ${product.name}`}
                    value={item.quantity}
                    onChange={(event) =>
                      changed(
                        'products',
                        form.products.map((part) =>
                          part.productId === product._id
                            ? { ...part, quantity: event.target.value }
                            : part
                        )
                      )
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
        {!filtered.length && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Không có sản phẩm phù hợp. Hãy tạo sản phẩm trước nếu danh mục còn trống.
          </p>
        )}
      </div>
      <FieldError error={errors.products} />
      {form.products.some((part) => !products.some((product) => product._id === part.productId)) && (
        <p role="alert" className="text-sm font-medium text-destructive-text">
          Có cấu phần không còn khả dụng trong kho. Vui lòng bỏ trước khi lưu.
        </p>
      )}
      {form.products
        .filter((part) => !products.some((product) => product._id === part.productId))
        .map((part) => (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 border-destructive/30 text-destructive-text hover:bg-destructive/10"
            key={part.productId}
            onClick={() =>
              changed(
                'products',
                form.products.filter((item) => item.productId !== part.productId)
              )
            }
          >
            Bỏ cấu phần không còn khả dụng
          </Button>
        ))}
    </fieldset>
  );

  const sourceCombo = combos.find(
    (combo) => combo._id === (kind === 'gifts' ? form.comboId : form.boxId)
  );
  const combo = comboEstimate(form, products);
  const gift = giftEstimate(
    editing ? row.value : sourceCombo?.value,
    form.bulkTiers,
    form.amenities,
    Number(quantity) || 1
  );
  const monthlyValue =
    form.sourceType === 'retail'
      ? editing
        ? undefined
        : form.products.reduce(
            (sum, part) =>
              sum +
              Number(products.find((p) => p._id === part.productId)?.price || 0) *
                Number(part.quantity || 0),
            0
          )
      : sourceCombo?.value;
  const termMonths = Number(form.planType.split('_')[0]);
  const prepaid =
    monthlyValue == null
      ? null
      : Math.round(Number(monthlyValue) * termMonths * (1 - Number(form.discountPercent || 0) / 100));

  async function save(event) {
    event.preventDefault();
    if (locked.current) return;
    const next = validatePackage(kind, form, editing, products, combos);
    if (
      files.length > 10 ||
      files.some(
        (file) =>
          file.size > 5 * 1024 * 1024 ||
          !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type) ||
          !/\.(jpe?g|png|webp)$/i.test(file.name)
      )
    ) {
      next.images = 'Tối đa 10 ảnh JPEG/PNG/WebP, mỗi ảnh không quá 5 MB.';
    }
    setErrors(next);
    setError('');
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        document.getElementById(`package-${Object.keys(next)[0]}`)?.focus()
      );
      return;
    }
    locked.current = true;
    setBusy(true);
    onDirtyChange(true, true);
    try {
      await saveManagerForm({
        tab: kind,
        form: { ...form, name: form.name.trim() },
        editing,
        images: files,
      });
      dirty.current = false;
      onDirtyChange(false);
      onSaved(`Đã ${editing ? 'lưu' : 'tạo'} ${labels[kind].toLocaleLowerCase('vi')}.`);
    } catch (failure) {
      setErrors(fieldErrors(failure));
      setError(managerError(failure));
    } finally {
      locked.current = false;
      setBusy(false);
      onDirtyChange(dirty.current);
    }
  }

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl"
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          close();
        }}
      >
        {/* Header Sheet */}
        <div className="flex items-start justify-between gap-3 border-b border-border bg-card p-5 sm:p-6">
          <div>
            <SheetTitle className="text-xl font-bold text-foreground">
              {editing ? 'Chỉnh sửa' : 'Tạo'} {labels[kind].toLocaleLowerCase('vi')}
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm text-muted-foreground">
              {kind === 'combos'
                ? 'Cấu phần, thời hạn mở bán và mức giảm giá của combo.'
                : kind === 'gifts'
                ? 'Quà tặng từ combo, chính sách giảm theo lượng và tiện ích kèm phí.'
                : 'Mẫu gói giao mỗi tháng, thu tiền trước cho toàn bộ kỳ hạn.'}
            </SheetDescription>
          </div>
          <Button
            type="button"
            aria-label="Đóng biểu mẫu"
            variant="ghost"
            className="size-11 shrink-0"
            disabled={busy}
            onClick={close}
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Nội dung form chia nhóm rõ ràng */}
        <form
          noValidate
          onSubmit={save}
          aria-busy={busy}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
            {error && <ErrorPanel>{error}</ErrorPanel>}

            {editing && kind === 'combos' && (
              <p className="rounded-lg border border-border bg-muted/60 p-3 text-sm text-muted-foreground">
                Phiên bản cấu phần: {row.definitionVersion ?? 'BE chưa trả'}. BE có thể khóa sửa/xóa khi combo đã gắn với đơn hàng hoặc hợp đồng đăng ký; lỗi 409 sẽ giữ nguyên biểu mẫu.
              </p>
            )}

            {kind === 'subscriptions' && editing && (
              <p className="rounded-lg border border-border bg-muted/60 p-3 text-sm text-muted-foreground">
                Nguồn gói: {form.sourceType === 'retail' ? 'Hàng lẻ (giữ nguyên cấu phần)' : 'Combo'}. Đây là mẫu gói; chỉnh sửa mẫu không thay đổi các hợp đồng đăng ký khách hàng đã mua trước đó.
              </p>
            )}

            {/* Nhóm 1: Thông tin cơ bản */}
            <fieldset
              disabled={busy}
              className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <legend className="px-2 text-sm font-semibold text-foreground">
                1. Thông tin chung
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">{field('name', 'Tên gói')}</div>
                {kind !== 'gifts' && (
                  <div className="sm:col-span-2">
                    {field('description', 'Mô tả chi tiết', 'text', kind === 'combos')}
                  </div>
                )}
              </div>
            </fieldset>

            {/* Nhóm 2: Cấu phần & Cấu hình đặc thù */}
            <fieldset
              disabled={busy}
              className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <legend className="px-2 text-sm font-semibold text-foreground">
                2. Cấu phần & Thiết lập chi tiết
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {kind === 'combos' && (
                  <ComboForm field={field} editing={editing} productPicker={productPicker} />
                )}
                {kind === 'gifts' && (
                  <GiftForm
                    field={field}
                    select={select}
                    editing={editing}
                    form={form}
                    change={changed}
                    combos={combos}
                  />
                )}
                {kind === 'subscriptions' && (
                  <SubscriptionForm
                    field={field}
                    select={select}
                    editing={editing}
                    form={form}
                    change={changed}
                    productPicker={productPicker}
                    combos={combos}
                  />
                )}
                {kind === 'subscriptions' && (editing || form.sourceType !== 'retail') && (
                  <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-foreground sm:col-span-2">
                    <input
                      type="checkbox"
                      className="size-5 rounded border-border"
                      checked={form.isActive}
                      onChange={(event) => changed('isActive', event.target.checked)}
                    />
                    Đang mở bán mẫu gói này cho khách hàng
                  </label>
                )}
              </div>
            </fieldset>

            {Object.entries(errors)
              .filter(([k]) =>
                ['bulkTiers', 'amenities', 'planType', 'sourceType', 'images'].includes(k)
              )
              .map(([k, value]) => (
                <FieldError key={k} error={value} />
              ))}

            {kind === 'combos' && (
              <fieldset
                disabled={busy}
                className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"
              >
                <legend className="px-2 text-sm font-semibold text-foreground">
                  3. Hình ảnh combo
                </legend>
                <ImageSelection
                  maxMB={5}
                  disabled={busy}
                  onChange={(next) => {
                    dirty.current = true;
                    onDirtyChange(true);
                    setFiles(next);
                  }}
                />
                {editing && (row.images || []).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Giữ {(row.images || []).length} ảnh hiện tại; ảnh mới được bổ sung khi lưu.
                  </p>
                )}
              </fieldset>
            )}

            {/* Nhóm 4: Bảng ước tính trước khi lưu */}
            <section
              className="space-y-3 rounded-xl border border-border bg-muted/60 p-4 sm:p-5 text-sm tabular-nums"
              aria-label="Xem trước ước tính giá"
            >
              <h3 className="font-semibold text-foreground">Ước tính giá trước khi lưu</h3>
              {kind === 'combos' ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng giá cấu phần:</span>
                    <span>{money(combo.base)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Sau mức giảm combo:</span>
                    <span>{money(combo.total)}</span>
                  </div>
                </div>
              ) : kind === 'gifts' ? (
                <div className="space-y-2">
                  <label className="flex flex-wrap items-center gap-3">
                    <span className="text-muted-foreground">Số gift xem trước:</span>
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      step={1}
                      className="min-h-11 w-24 text-base"
                      value={quantity}
                      onChange={(event) =>
                        setQuantity(Math.min(999, Math.max(1, Number(event.target.value) || 1)))
                      }
                    />
                  </label>
                  {editing || sourceCombo ? (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tiền hàng gốc:</span>
                        <span>{money(gift.base)}</span>
                      </div>
                      <div className="flex justify-between text-success-text">
                        <span>Giảm theo số lượng:</span>
                        <span>−{money(gift.discount)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Phí tiện ích đi kèm:</span>
                        <span>+{money(gift.fee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border">
                        <span>Tổng ước tính:</span>
                        <span>{money(gift.total)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Vui lòng chọn combo nguồn để xem ước tính giá gift.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Sau khi lưu, dùng chức năng &ldquo;Báo giá BE&rdquo; ở danh sách để lấy báo giá chính xác.
                  </p>
                </div>
              ) : (
                /* Subscriptions: "Tổng thu trước" tách riêng "Bình quân mỗi tháng" */
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2 rounded-lg bg-card p-3 border border-border">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Tổng thu trước ước tính:
                      </span>
                      <span className="text-base font-bold tabular-nums text-foreground">
                        {money(prepaid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Bình quân mỗi tháng:
                      </span>
                      <span className="text-base font-medium tabular-nums text-foreground">
                        {money(prepaid == null ? null : Math.round(prepaid / termMonths))}
                      </span>
                    </div>
                  </div>
                  {form.sourceType === 'retail' && editing && (
                    <p className="text-xs text-muted-foreground">
                      BE không trả cấu phần hàng lẻ trong danh sách mẫu; xem giá đã lưu ở danh sách, không suy ngược thành giá thanh toán mới.
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Giá đã lưu và số tiền thực thu cuối cùng lấy từ phản hồi của máy chủ TotMart.
              </p>
            </section>
          </div>

          {/* Thanh lưu cố định ở đáy (Sticky Bottom Action Bar) */}
          <footer className="sticky bottom-0 z-10 flex shrink-0 justify-end gap-3 border-t border-border bg-background/95 p-4 backdrop-blur-xs pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={close}
            >
              Hủy
            </Button>
            <Button className="min-h-11" disabled={busy}>
              {busy ? 'Đang lưu…' : 'Lưu dữ liệu'}
            </Button>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}
