"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Loader2,
  ImagePlus,
  X,
  Search,
  Trash2,
  Package,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { createBoxApi, updateBoxApi } from "@/app/services/api/boxService";
import { getAllProductsApi } from "@/app/services/api/productServices";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val ?? 0,
  );

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day, 12, 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

const EMPTY_PRODUCT = () => ({
  productId: "",
  name: "",
  quantity: 1,
  price: 0,
});

const INITIAL_FORM = {
  name: "",
  description: "",
  stock: 1,
  discountPercent: 0,
  validFrom: "",
  validTo: "",
  isGift: false,
};

// ─── Product Picker Popover ────────────────────────────────────────────────────
function ProductPicker({ onSelect, availableProducts }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = availableProducts.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 px-3 text-sm rounded-md border border-input bg-white hover:bg-gray-50 text-gray-700 transition-colors w-full truncate"
      >
        <Search size={14} className="text-gray-400 shrink-0" />
        <span className="truncate text-gray-400">Tìm và chọn sản phẩm...</span>
        <ChevronDown size={14} className="ml-auto text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                Không tìm thấy sản phẩm
              </div>
            ) : (
              filtered.map((p) => {
                const imgUrl =
                  Array.isArray(p.images) && p.images[0]?.url
                    ? p.images[0].url
                    : null;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      onSelect(p);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg border bg-gray-50 overflow-hidden shrink-0 relative">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-indigo-600 font-semibold">
                        {fmtPrice(p.price)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Product Row ───────────────────────────────────────────────────────────────
function ProductRow({
  item,
  index,
  availableProducts,
  onChange,
  onRemove,
  error,
}) {
  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-3 space-y-2.5 hover:border-indigo-200 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {item.name ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800 truncate">
                {item.name}
              </span>
              <span className="text-xs text-indigo-600 font-semibold shrink-0">
                {fmtPrice(item.price)}
              </span>
            </div>
          ) : (
            <ProductPicker
              availableProducts={availableProducts}
              onSelect={(p) =>
                onChange(index, {
                  productId: p._id,
                  name: p.name,
                  price: p.price || 0,
                })
              }
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {item.productId && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-500 shrink-0">Số lượng</Label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  onChange(index, "quantity", Math.max(1, item.quantity - 1))
                }
                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold text-gray-800">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onChange(index, "quantity", item.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            Tổng:{" "}
            <span className="font-semibold text-gray-700">
              {fmtPrice(item.price * item.quantity)}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange(index, { productId: "", name: "", price: 0 })
            }
            className="ml-auto text-xs text-indigo-500 hover:text-indigo-700 underline"
          >
            Đổi sản phẩm
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Main Dialog ───────────────────────────────────────────────────────────────
export function BoxFormDialog({ open, onOpenChange, box, onSuccess }) {
  const isEdit = !!box;

  const [form, setForm] = useState(INITIAL_FORM);
  const [products, setProducts] = useState([EMPTY_PRODUCT()]);
  const [images, setImages] = useState([]); // File[] mới
  const [existingImages, setExistingImages] = useState([]); // { url, public_id }[] từ DB
  const [imagePreviews, setImagePreviews] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Load danh sách sản phẩm
  useEffect(() => {
    getAllProductsApi()
      .then((res) => {
        const data = res?.data?.data || res?.data?.products || res?.data || [];
        setAvailableProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  // Reset / điền form khi mở
  useEffect(() => {
    if (!open) return;

    if (isEdit && box) {
      setForm({
        name: box.name || "",
        description: box.description || box.descriptions || "",
        stock: box.stock ?? 1,
        discountPercent: box.discountPercent ?? 0,
        validFrom: box.validFrom ? box.validFrom.split("T")[0] : "",
        validTo: box.validTo ? box.validTo.split("T")[0] : "",
        isGift: box.isGift ?? false,
      });

      const mapped = (box.products || []).map((p) => ({
        productId: p.productId?._id || p.productId || p._id || "",
        name: p.name || p.productId?.name || "",
        price: p.price || p.productId?.price || 0,
        quantity: p.quantity || 1,
      }));
      setProducts(mapped.length ? mapped : [EMPTY_PRODUCT()]);

      const imgs = (box.images || []).map((img) =>
        typeof img === "string" ? { url: img } : img,
      );
      setExistingImages(imgs);
      setImagePreviews(imgs.map((i) => i.url));
      setImages([]);
    } else {
      setForm(INITIAL_FORM);
      setProducts([EMPTY_PRODUCT()]);
      setImages([]);
      setExistingImages([]);
      setImagePreviews([]);
    }
    setErrors({});
  }, [open, box, isEdit]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      imagePreviews
        .filter((p) => p.startsWith("blob:"))
        .forEach((p) => URL.revokeObjectURL(p));
    };
  }, [imagePreviews]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleImageSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const valid = selected.filter((f) => {
      const ok = f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024;
      if (!ok) toast.error(`${f.name}: ảnh phải < 5MB`);
      return ok;
    });

    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...valid]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    const totalExisting = existingImages.length;
    if (idx < totalExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== idx));
      setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    } else {
      const newIdx = idx - totalExisting;
      const blobUrl = imagePreviews[idx];
      if (blobUrl?.startsWith("blob:")) URL.revokeObjectURL(blobUrl);
      setImages((prev) => prev.filter((_, i) => i !== newIdx));
      setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleChangeProduct = useCallback((index, fieldOrObj, value) => {
    setProducts((prev) => {
      const next = [...prev];
      if (typeof fieldOrObj === "object" && fieldOrObj !== null) {
        next[index] = { ...next[index], ...fieldOrObj };
      } else {
        next[index] = { ...next[index], [fieldOrObj]: value };
      }
      return next;
    });
  }, []);

  const addProduct = () => setProducts((prev) => [...prev, EMPTY_PRODUCT()]);

  const removeProduct = (index) => {
    setProducts((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : [EMPTY_PRODUCT()],
    );
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Tên box là bắt buộc";
    if (form.stock < 1) e.stock = "Tồn kho phải ≥ 1";
    if (!form.description.trim()) e.description = "Mô tả là bắt buộc";
    if (!form.validFrom) e.validFrom = "Ngày bắt đầu là bắt buộc";
    if (!form.validTo) e.validTo = "Ngày kết thúc là bắt buộc";
    if (form.validFrom && form.validTo) {
      const df = parseLocalDate(form.validFrom);
      const dt = parseLocalDate(form.validTo);
      if (df && dt && df > dt)
        e.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (!isEdit && images.length === 0) e.images = "Cần ít nhất 1 ảnh";
    if (isEdit && existingImages.length === 0 && images.length === 0)
      e.images = "Cần ít nhất 1 ảnh";

    const hasEmptyProduct = products.some((p) => !p.productId);
    if (hasEmptyProduct) e.products = "Vui lòng chọn đầy đủ sản phẩm";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();

      // Thông tin cơ bản
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("stock", String(Number(form.stock)));
      formData.append("discountPercent", String(Number(form.discountPercent)));
      formData.append("isGift", String(form.isGift));

      // Ngày
      const dateFrom = parseLocalDate(form.validFrom);
      const dateTo = parseLocalDate(form.validTo);
      formData.append("validFrom", dateFrom.toISOString());
      formData.append("validTo", dateTo.toISOString());

      // Sản phẩm — format [index][field]
      const validProducts = products.filter((p) => p.productId);
      validProducts.forEach((p, i) => {
        formData.append(`products[${i}][productId]`, p.productId);
        formData.append(
          `products[${i}][quantity]`,
          String(Number(p.quantity) || 1),
        );
      });

      // Ảnh mới
      images.forEach((file) => {
        if (file instanceof File) formData.append("images", file);
      });

      if (isEdit) {
        await updateBoxApi(box._id, formData);
        toast.success("Cập nhật box thành công!");
      } else {
        await createBoxApi(formData);
        toast.success("Tạo box thành công!");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Đã có lỗi xảy ra";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Computed ─────────────────────────────────────────────────────────────────
  const subtotal = products
    .filter((p) => p.productId)
    .reduce((acc, p) => acc + p.price * (p.quantity || 1), 0);

  const computedValue =
    form.discountPercent > 0
      ? subtotal * (1 - form.discountPercent / 100)
      : subtotal;

  const today = new Date().toISOString().split("T")[0];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Package size={16} className="text-indigo-600" />
            </div>
            {isEdit ? `Chỉnh sửa: ${box?.name}` : "Tạo Box mới"}
          </DialogTitle>
        </DialogHeader>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* ── Thông tin cơ bản ── */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Thông tin cơ bản
            </h3>
            <div className="space-y-4">
              {/* Tên */}
              <div className="space-y-1.5">
                <Label>
                  Tên Box <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="VD: Premium Mystery Box"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={errors.name ? "border-red-400" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Mô tả */}
              <div className="space-y-1.5">
                <Label>
                  Mô tả <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  rows={3}
                  placeholder="Mô tả nội dung và điểm nổi bật của box..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className={`resize-none ${errors.description ? "border-red-400" : ""}`}
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Tồn kho + Giảm giá */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    Tồn kho <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        stock: Number(e.target.value) || 1,
                      }))
                    }
                    className={errors.stock ? "border-red-400" : ""}
                  />
                  {errors.stock && (
                    <p className="text-xs text-red-500">{errors.stock}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Giảm giá (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discountPercent: Math.min(
                          100,
                          Math.max(0, Number(e.target.value) || 0),
                        ),
                      }))
                    }
                  />
                </div>
              </div>

              {/* Ngày */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    min={today}
                    value={form.validFrom}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, validFrom: e.target.value }))
                    }
                    className={errors.validFrom ? "border-red-400" : ""}
                  />
                  {errors.validFrom && (
                    <p className="text-xs text-red-500">{errors.validFrom}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    min={form.validFrom || today}
                    value={form.validTo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, validTo: e.target.value }))
                    }
                    className={errors.validTo ? "border-red-400" : ""}
                  />
                  {errors.validTo && (
                    <p className="text-xs text-red-500">{errors.validTo}</p>
                  )}
                </div>
              </div>

              {/* Gift toggle */}
              <div className="flex items-center gap-3 py-1">
                <Switch
                  checked={form.isGift}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isGift: v }))}
                  id="isGift"
                />
                <Label htmlFor="isGift" className="cursor-pointer">
                  Đánh dấu là Box quà tặng
                </Label>
              </div>
            </div>
          </section>

          {/* ── Hình ảnh ── */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Hình ảnh{" "}
              {!isEdit && (
                <span className="text-red-500 normal-case font-normal">*</span>
              )}
            </h3>

            <div className="space-y-3">
              {/* Upload zone */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors ${
                  errors.images ? "border-red-300" : "border-gray-200"
                }`}
              >
                <ImagePlus size={20} className="text-gray-400" />
                <p className="text-sm text-gray-500">
                  Click để chọn ảnh{" "}
                  <span className="text-gray-400">(tối đa 5MB / ảnh)</span>
                </p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              {errors.images && (
                <p className="text-xs text-red-500">{errors.images}</p>
              )}

              {/* Preview grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                    >
                      <Image
                        src={src}
                        alt={`img-${i}`}
                        fill
                        className="object-cover"
                        unoptimized={src.startsWith("blob:")}
                      />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                          Đại diện
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Sản phẩm ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Sản phẩm trong box
              </h3>
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Plus size={13} />
                Thêm sản phẩm
              </button>
            </div>

            <div className="space-y-2">
              {products.map((p, i) => (
                <ProductRow
                  key={i}
                  item={p}
                  index={i}
                  availableProducts={availableProducts}
                  onChange={handleChangeProduct}
                  onRemove={removeProduct}
                  error={errors[`product_${i}`]}
                />
              ))}
            </div>
            {errors.products && (
              <p className="text-xs text-red-500 mt-1">{errors.products}</p>
            )}

            {/* Summary */}
            {subtotal > 0 && (
              <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-3 space-y-1">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tổng giá sản phẩm</span>
                  <span>{fmtPrice(subtotal)}</span>
                </div>
                {form.discountPercent > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Giảm giá ({form.discountPercent}%)</span>
                    <span>
                      −{fmtPrice(subtotal * (form.discountPercent / 100))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-indigo-700 border-t border-indigo-200 pt-1">
                  <span>Giá trị box</span>
                  <span>{fmtPrice(computedValue)}</span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-gray-50/50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 min-w-28"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                {isEdit ? "Đang lưu..." : "Đang tạo..."}
              </>
            ) : isEdit ? (
              "Lưu thay đổi"
            ) : (
              "Tạo Box"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
