"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { createBoxApi } from "@/app/services/api/boxService";
import { getAllProductsApi } from "@/app/services/api/productServices";

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

  // ✅ Sử dụng key "descriptions" đúng chuẩn Backend
  const [form, setForm] = useState({
    name: "",
    stock: 1,
    description: "",
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

  // Fix hydration issues in Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tải danh sách sản phẩm khả dụng khi mount component
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
        console.error("Lỗi khi tải sản phẩm:", err);
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

  const handleChangeProduct = (index, updatedProduct) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updatedProduct };
      return next;
    });
  };

  const computedValue = useMemo(() => {
    return products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
      0,
    );
  }, [products]);

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
    if (!form.description || !form.description.trim())
      newErrors.description = "Mô tả là bắt buộc";
    if (!form.validFrom) newErrors.validFrom = "Ngày bắt đầu là bắt buộc";
    if (!form.validTo) newErrors.validTo = "Ngày kết thúc là bắt buộc";
    if (form.validFrom && form.validTo && form.validFrom > form.validTo) {
      newErrors.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (!form.images || form.images.length === 0) {
      newErrors.images = "Cần có ít nhất 1 ảnh";
    }

    const productErrors = [];
    let hasProductError = false;
    products.forEach((p, idx) => {
      if (!p.productId) {
        hasProductError = true;
        productErrors[idx] = "Vui lòng chọn sản phẩm";
      }
    });

    if (hasProductError) {
      newErrors.products = "Vui lòng chọn đầy đủ sản phẩm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Gửi API dưới dạng FormData (Thích hợp cho tải ảnh và mảng dữ liệu)
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    try {
      const formData = new FormData();

      // Thêm các trường dữ liệu cơ bản
      formData.append("name", form.name.trim());
      formData.append("stock", Number(form.stock));
      formData.append("description", form.description.trim());
      formData.append("validFrom", form.validFrom);
      formData.append("validTo", form.validTo);
      formData.append("discountPercent", Number(form.discountPercent));
      formData.append("isGift", form.isGift);

      // ✅ FIX ❶: Thêm từng ID sản phẩm dạng chuỗi vào FormData
      products.forEach((p) => {
        if (p.productId) {
          formData.append("products", p.productId);
        }
      });

      // ✅ FIX ❷: Đưa tất cả file ảnh vào FormData
      form.images.forEach((file) => {
        formData.append("images", file);
      });

      await createBoxApi(formData);
      toast.success("Tạo box thành công!");
      router.push("/admin-box");
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.message || err.message || "Đã có lỗi xảy ra";
      setApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <BoxFormHeader />

        {apiError && (
          <div className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <Card>
          <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
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
              availableProducts={availableProducts}
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
