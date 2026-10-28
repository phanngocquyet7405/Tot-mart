"use client";
import logger from "@/app/util/Logger";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { createBoxApi } from "@/app/services/api/boxService";
import { getAllProductsApi } from "@/app/services/api/productServices";
import { axiosConfig } from '@/app/services/api/axiosConfig';

import { BoxFormHeader } from "../../components/box/createbox/BoxFormHeader";
import { BasicInfoSection } from "../../components/box/createbox/Basicinfosection";
import { ValiditySection } from "../../components/box/createbox/Validitysection";
import { BoxSection } from "../../components/box/createbox/BoxSection";
import { FormFooter } from "../../components/box/createbox/BoxFooter";

const EMPTY_PRODUCT = () => ({
  productId: "",
  name: "",
  quantity: 1,
  price: 0,
});

export default function CreateBoxPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [ownerId, setOwnerId] = useState('');
  useEffect(() => {
    axiosConfig.get('/brands/merchant-options').then(res => setMerchants(res.data || [])).catch(() => toast.error('Không tải được merchant. Hãy tải lại trang.'));
  }, []);

  const [form, setForm] = useState({
    name: "",
    stock: 1,
    descriptions: "",
    validFrom: "",
    validTo: "",
    discountPercent: 0,
    isGift: false,
    images: [],
  });

  const [products, setProducts] = useState([EMPTY_PRODUCT()]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getAllProductsApi();
        if (res.data && res.data.products) {
          setAvailableProducts(res.data.products);
        } else if (res.data) {
          setAvailableProducts(res.data);
        }
      } catch (err) {
        logger.error("Lỗi khi tải sản phẩm:", err);
        toast.error("Không thể tải danh sách sản phẩm!");
      }
    }
    fetchProducts();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddProduct = () => {
    setProducts((prev) => [...prev, EMPTY_PRODUCT()]);
  };

  const handleRemoveProduct = (index) => {
    if (products.length > 1) {
      setProducts((prev) => prev.filter((_, i) => i !== index));
    } else {
      setProducts([EMPTY_PRODUCT()]);
    }
  };

  const handleChangeProduct = (index, fieldOrObject, value) => {
    setProducts((prev) => {
      const next = [...prev];
      if (typeof fieldOrObject === "object" && fieldOrObject !== null) {
        next[index] = { ...next[index], ...fieldOrObject };
      } else {
        next[index] = { ...next[index], [fieldOrObject]: value };
      }
      return next;
    });
  };

  const fmtPrice = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const validate = () => {
    const newErrors = {};
    if (!form.name || !form.name.trim()) newErrors.name = "Tên box là bắt buộc";
    if (form.stock < 1)
      newErrors.stock = "Số lượng tồn kho phải lớn hơn hoặc bằng 1";
    if (!form.descriptions || !form.descriptions.trim())
      newErrors.descriptions = "Mô tả là bắt buộc";
    if (!form.validFrom) newErrors.validFrom = "Ngày bắt đầu là bắt buộc";
    if (!form.validTo) newErrors.validTo = "Ngày kết thúc là bắt buộc";

    const dFrom = new Date(form.validFrom);
    const dTo = new Date(form.validTo);

    if (form.validFrom && isNaN(dFrom.getTime()))
      newErrors.validFrom = "Ngày bắt đầu không hợp lệ";
    if (form.validTo && isNaN(dTo.getTime()))
      newErrors.validTo = "Ngày kết thúc không hợp lệ";

    if (form.validFrom && form.validTo && dFrom > dTo) {
      newErrors.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (!form.images || form.images.length === 0) {
      newErrors.images = "Cần có ít nhất 1 ảnh";
    }

    let hasProductError = false;
    products.forEach((p) => {
      if (!p.productId) hasProductError = true;
    });

    if (hasProductError) {
      newErrors.products = "Vui lòng chọn đầy đủ sản phẩm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!ownerId || !merchants.some(m => m._id === ownerId)) { toast.error('Chọn merchant sở hữu combo.'); return; }
    if (new Set(products.map(p => p.productId)).size !== products.length || products.some(p => !Number.isInteger(p.quantity) || p.quantity < 1 || !availableProducts.some(row => row._id === p.productId && (row.ownerId?._id || row.ownerId) === ownerId))) { toast.error('Cấu phần phải duy nhất, đúng merchant và số lượng nguyên dương.'); return; }
    logger.log("[1] Bắt đầu tiến trình Submit...");

    // Chỉnh sửa hàm validate một chút để lấy log chuẩn hoặc log trực tiếp trong validate()
    if (!validate()) {
      logger.warn("[2] Form không hợp lệ!");
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const formData = new FormData();
      formData.append('ownerId', ownerId);

      // 1. Thông tin cơ bản
      formData.append("name", form.name.trim());
      formData.append("stock", Number(form.stock) || 0);
      formData.append("descriptions", form.descriptions.trim());
      formData.append("discountPercent", Number(form.discountPercent) || 0);
      formData.append("isGift", String(form.isGift));

      // 2. Parse ngày tránh lệch timezone
      const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split("-").map(Number);
        const d = new Date(year, month - 1, day, 12, 0, 0);
        return isNaN(d.getTime()) ? null : d;
      };

      const dateFrom = parseLocalDate(form.validFrom);
      const dateTo = parseLocalDate(form.validTo);

      if (!dateFrom || !dateTo) {
        logger.error("Lỗi parse ngày:", {
          validFrom: form.validFrom,
          validTo: form.validTo,
        });
        setApiError("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ");
        setLoading(false);
        return;
      }

      formData.append("validFrom", dateFrom.toISOString());
      formData.append("validTo", dateTo.toISOString());

      // 3. Sản phẩm
      const productsPayload = products
        .filter((p) => p.productId)
        .map((p) => ({
          productId: p.productId,
          quantity: Number(p.quantity) || 1,
        }));

      productsPayload.forEach((p, index) => {
        formData.append(`products[${index}][productId]`, p.productId);
        formData.append(`products[${index}][quantity]`, String(p.quantity));
      });

      // 4. Hình ảnh
      form.images.forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file);
        }
      });

      await createBoxApi(formData);
      toast.success("Tạo combo thành công!");
      router.push("/admin-box");
    } catch (err) {
      const status = err.response?.status;
      const errorData = err.response?.data;
      const requestId = errorData?.requestId;

      let errMsg = "Đã có lỗi xảy ra. Vui lòng thử lại.";
      if (status === 503) {
        errMsg = "Hệ thống đang bận. Vui lòng thử lại sau ít phút." + (requestId ? ` (Mã: ${requestId})` : "");
      } else if (status && status >= 500) {
        errMsg = "Lỗi hệ thống. Vui lòng thử lại." + (requestId ? ` (Mã: ${requestId})` : "");
      } else if (errorData?.errors && Array.isArray(errorData.errors)) {
        errMsg = errorData.errors.map((e) => e.message || e).join(" | ");
      } else if (errorData?.message) {
        errMsg = errorData.message;
      } else if (err.message) {
        errMsg = err.message;
      }

      setApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Giá trị box hiển thị cho admin (BE tự tính lại theo giá trong DB khi lưu)
  const subtotal = products
    .filter((p) => p.productId)
    .reduce(
      (acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 1),
      0,
    );
  const computedValue =
    Number(form.discountPercent) > 0
      ? subtotal * (1 - Number(form.discountPercent) / 100)
      : subtotal;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <BoxFormHeader />

        {apiError && (
          <div className="mb-5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive-text flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{apiError}</span>
          </div>
        )}

        <Card>
          <CardContent className="p-0 divide-y divide-border dark:divide-border">
            <div className="p-6 space-y-2">
              <label htmlFor="combo-merchant">Merchant sở hữu</label>
              <select id="combo-merchant" className="w-full rounded border p-2" value={ownerId} disabled={loading} onChange={event => { setOwnerId(event.target.value); setProducts([EMPTY_PRODUCT()]); }}>
                <option value="">Chọn merchant</option>
                {merchants.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <BasicInfoSection
              form={form}
              errors={errors}
              onChange={handleChange}
            />

            <ValiditySection
              form={form}
              errors={errors}
              onChange={handleChange}
            />

            <BoxSection
              products={products}
              availableProducts={availableProducts.filter(p => (p.ownerId?._id || p.ownerId) === ownerId && !p.archivedAt)}
              errors={errors}
              computedValue={computedValue}
              discountPercent={form.discountPercent}
              fmtPrice={fmtPrice}
              onChangeProduct={handleChangeProduct}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
            />
          </CardContent>

          <FormFooter
            loading={loading}
            cancelHref="/admin-box"
            onSubmit={handleSubmit}
          />
        </Card>
      </div>
    </div>
  );
}
