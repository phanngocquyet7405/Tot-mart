"use client";

import { useState, useEffect } from "react";
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
    if (!form.description || !form.description.trim())
      newErrors.description = "Mô tả là bắt buộc";
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
    console.log("[1] Bắt đầu tiến trình Submit...");

    // Chỉnh sửa hàm validate một chút để lấy log chuẩn hoặc log trực tiếp trong validate()
    if (!validate()) {
      console.warn("[2] Form không hợp lệ!");
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const formData = new FormData();

      // 1. Thông tin cơ bản
      formData.append("name", form.name.trim());
      formData.append("stock", Number(form.stock) || 0);
      formData.append("description", form.description.trim());
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
        console.error("Lỗi parse ngày:", {
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

      // --- ĐOẠN LOG BỔ SUNG ĐỂ KIỂM TRA DATA TRƯỚC KHI GỬI ---
      console.group("[3] Kiểm tra dữ liệu FormData gửi đi");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `👉 ${key}: File -> Name: ${value.name}, Size: ${value.size} bytes`,
          );
        } else {
          console.log(`👉 ${key}:`, value);
        }
      }
      console.groupEnd();
      // -----------------------------------------------------

      console.log("[4] Gửi Request tới API...");
      const response = await createBoxApi(formData);

      console.log("full reponse", response);

      console.log(
        "[5] Tạo thành công. Kèm data phản hồi:",
        response.data.images,
      );

      toast.success("Tạo box thành công!");
      router.push("/admin-box");
    } catch (err) {
      console.group("Lỗi API khi tạo Box");
      const errorData = err.response?.data;
      console.error("Chi tiết Error Object:", err);
      console.error("Dữ liệu lỗi từ BE:", errorData);
      console.groupEnd();

      let errMsg = "Đã có lỗi xảy ra";
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errMsg = errorData.errors.map((e) => e.message || e).join(" | ");
      } else if (errorData?.message) {
        errMsg = errorData.message;
      } else {
        errMsg = err.message;
      }

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
            <span className="whitespace-pre-wrap">{apiError}</span>
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
