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
import { axiosConfig } from "@/app/services/api/axiosConfig";

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
  ownerId: "",
  name: "",
  descriptions: "",
  stock: 1,
  discountPercent: 0,
  validFrom: "",
  validTo: "",
  isGift: false,
};

import { ProductRow } from "./parts/ProductRow";
import { BoxImageSection } from "./parts/BoxImageSection";
import { BoxPriceSummary } from "./parts/BoxPriceSummary";
import { BoxBasicInfoSection } from "./parts/BoxBasicInfoSection";

// ─── Main Dialog ───────────────────────────────────────────────────────────────
export function BoxFormDialog({ open, onOpenChange, box, onSuccess }) {
  const isEdit = !!box;

  const [form, setForm] = useState(INITIAL_FORM);
  const [products, setProducts] = useState([EMPTY_PRODUCT()]);
  const [images, setImages] = useState([]); // File[] mới
  const [existingImages, setExistingImages] = useState([]); // { url, public_id }[] từ DB
  const [imagePreviews, setImagePreviews] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  useEffect(() => {
    axiosConfig
      .get("/brands/merchant-options")
      .then((res) => setMerchants(res.data || []))
      .catch(() =>
        toast.error("Không tải được merchant. Hãy mở lại biểu mẫu."),
      );
  }, []);
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
        ownerId: box.ownerId?._id || box.ownerId || "",
        name: box.name || "",
        descriptions: box.descriptions || box.description || "",
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

  // Cleanup the previews captured by this effect when they change or unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((p) => {
        if (typeof p === "string" && p.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(p);
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      });
    };
  }, [imagePreviews]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleImageSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const valid = selected.filter((f) => {
      const ok =
        ["image/jpeg", "image/png", "image/webp"].includes(f.type) &&
        f.size <= 5 * 1024 * 1024;
      if (!ok) toast.error(`${f.name}: ảnh phải < 5MB`);
      return ok;
    });

    if (existingImages.length + images.length + valid.length > 10) {
      toast.error("Tối đa 10 ảnh");
      e.target.value = "";
      return;
    }
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
    if (!form.ownerId)
      e.ownerId =
        "Chọn merchant sở hữu combo; dữ liệu legacy cần đối chiếu trước khi sửa.";
    if (
      products.some((p) => !Number.isInteger(p.quantity) || p.quantity < 1) ||
      new Set(products.map((p) => p.productId)).size !== products.length
    )
      e.products = "Sản phẩm phải duy nhất, số lượng nguyên dương.";
    if (
      products.some(
        (p) =>
          !availableProducts.some(
            (row) =>
              row._id === p.productId &&
              (row.ownerId?._id || row.ownerId) === form.ownerId,
          ),
      )
    )
      e.products =
        "Cấu phần thiếu hoặc khác merchant. Đối chiếu dữ liệu trước khi lưu.";
    if (!(form.name ?? "").trim()) e.name = "Tên box là bắt buộc";
    if (form.stock < 1) e.stock = "Tồn kho phải ≥ 1";
    if (!(form.descriptions ?? "").trim()) e.descriptions = "Mô tả là bắt buộc";
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
    if (isSaving || !validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      if (!isEdit) formData.append("ownerId", form.ownerId);

      // Thông tin cơ bản
      formData.append("name", (form.name ?? "").trim());
      formData.append("descriptions", (form.descriptions ?? "").trim());
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
        formData.append("existingImages", JSON.stringify(existingImages));
        await updateBoxApi(box._id, formData);
        toast.success("Cập nhật box thành công!");
      } else {
        await createBoxApi(formData);
        toast.success("Tạo box thành công!");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      const status = err?.response?.status;
      const requestId = err?.response?.data?.requestId || err?.requestId || err?.response?.headers?.["x-request-id"];
      let msg =
        err?.response?.data?.errors?.map((e) => e.message).join(" | ") ||
        err?.response?.data?.message ||
        err?.message ||
        "Đã có lỗi xảy ra";
      if (status >= 500) {
        msg = "Lỗi hệ thống. Vui lòng thử lại.";
      }
      if (requestId) {
        msg = `${msg} (Request ID: ${requestId})`;
      }
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
      <DialogContent className="w-[calc(100%-2rem)] max-w-6xl sm:max-w-6xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
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
          <div className="space-y-2">
            <Label htmlFor="combo-owner">Merchant sở hữu</Label>
            <select
              id="combo-owner"
              className="w-full rounded border p-2"
              disabled={isEdit || isSaving}
              value={form.ownerId || ""}
              onChange={(event) => {
                setForm((f) => ({ ...f, ownerId: event.target.value }));
                setProducts([EMPTY_PRODUCT()]);
              }}
            >
              <option value="">Chọn merchant</option>
              {merchants.map((merchant) => (
                <option key={merchant._id} value={merchant._id}>
                  {merchant.name}
                </option>
              ))}
            </select>
            {errors.ownerId && <p role="alert">{errors.ownerId}</p>}
          </div>
          {/* ── Thông tin cơ bản ── */}
          <BoxBasicInfoSection
            form={form}
            setForm={setForm}
            errors={errors}
            today={today}
          />

          {/* ── Hình ảnh ── */}
          <BoxImageSection
            isEdit={isEdit}
            errors={errors}
            fileInputRef={fileInputRef}
            handleImageSelect={handleImageSelect}
            imagePreviews={imagePreviews}
            removeImage={removeImage}
          />

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
                  availableProducts={availableProducts.filter(
                    (p) =>
                      (p.ownerId?._id || p.ownerId) === form.ownerId &&
                      !p.archivedAt &&
                      !products.some((row) => row.productId === p._id),
                  )}
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
            <BoxPriceSummary
              subtotal={subtotal}
              discountPercent={form.discountPercent}
              computedValue={computedValue}
            />
          </section>
        </div>

        {/* Footer */}
        <DialogFooter className="mx-0 mb-0 px-6 py-4 border-t shrink-0 bg-gray-50/50">
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
