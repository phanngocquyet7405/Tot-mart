"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { getBoxByIdApi, updateBoxApi } from "@/app/services/api/boxService";
import { getAllProductsApi } from "@/app/services/api/productServices";

const fmtPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val,
  );

export default function UpdateBoxPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [boxRes, productsRes] = await Promise.all([
          getBoxByIdApi(id),
          getAllProductsApi(),
        ]);
        const box = boxRes.data;
        setForm({
          name: box.name || "",
          stock: box.stock || 1,
          description: box.description || "",
          validFrom: box.validFrom?.slice(0, 10) || "",
          validTo: box.validTo?.slice(0, 10) || "",
          discountPercent: box.discountPercent || 0,
          isGift: box.isGift || false,
        });
        setProducts(
          (box.products || []).map((p) => ({
            productId: p._id || p.productId || "",
            name: p.name || "",
            quantity: p.quantity || 1,
            price: p.price || 0,
          })),
        );
        if (productsRes.data?.products) {
          setAvailableProducts(productsRes.data.products);
        } else if (productsRes.data) {
          setAvailableProducts(productsRes.data);
        }
      } catch (err) {
        setApiError(err.response?.data?.message || err.message);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  const handleChangeProduct = (index, field, value) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSelectProduct = (index, productId) => {
    const selected = availableProducts.find((p) => p._id === productId);
    if (selected) {
      setProducts((prev) => {
        const next = [...prev];
        next[index] = {
          productId: selected._id,
          name: selected.name,
          quantity: prev[index].quantity || 1,
          price: selected.price || 0,
        };
        return next;
      });
    }
  };

  const handleAddProduct = () =>
    setProducts((prev) => [
      ...prev,
      { productId: "", name: "", quantity: 1, price: 0 },
    ]);

  const handleRemoveProduct = (index) => {
    if (products.length > 1) {
      setProducts((prev) => prev.filter((_, i) => i !== index));
    } else {
      setProducts([{ productId: "", name: "", quantity: 1, price: 0 }]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = "Tên box là bắt buộc";
    if (form.stock < 1) newErrors.stock = "Số lượng tồn kho phải >= 1";
    if (!form.description?.trim()) newErrors.description = "Mô tả là bắt buộc";
    if (!form.validFrom) newErrors.validFrom = "Ngày bắt đầu là bắt buộc";
    if (!form.validTo) newErrors.validTo = "Ngày kết thúc là bắt buộc";
    if (form.validFrom && form.validTo && form.validFrom > form.validTo)
      newErrors.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
    if (products.some((p) => !p.productId))
      newErrors.products = "Vui lòng chọn đầy đủ sản phẩm";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("stock", Number(form.stock));
      formData.append("description", form.description.trim());
      formData.append("discountPercent", Number(form.discountPercent) || 0);
      formData.append("isGift", String(form.isGift));

      const parseLocalDate = (dateStr) => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
      };
      formData.append(
        "validFrom",
        parseLocalDate(form.validFrom).toISOString(),
      );
      formData.append("validTo", parseLocalDate(form.validTo).toISOString());

      products
        .filter((p) => p.productId)
        .forEach((p, index) => {
          formData.append(`products[${index}]`, p.productId);
        });

      await updateBoxApi(id, formData);
      toast.success("Cập nhật box thành công!");
      router.push("/admin-box");
    } catch (err) {
      const errorData = err.response?.data;
      let errMsg = "Đã có lỗi xảy ra";
      if (errorData?.errors && Array.isArray(errorData.errors))
        errMsg = errorData.errors.map((e) => e.message || e).join(" | ");
      else if (errorData?.message) errMsg = errorData.message;
      else errMsg = err.message;
      setApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-gray-400">Đang tải thông tin box...</span>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-red-500">Không tìm thấy box</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Chỉnh sửa Box
          </h1>
          <p className="text-sm text-gray-500 mt-1">Đang sửa: {form.name}</p>
        </div>

        {apiError && (
          <div className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{apiError}</span>
          </div>
        )}

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Thông tin cơ bản
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Tên box *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.name ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                />
                {errors.name && (
                  <span className="text-xs text-red-500">{errors.name}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Tồn kho *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.stock}
                    onChange={(e) => handleChange("stock", +e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.stock ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  {errors.stock && (
                    <span className="text-xs text-red-500">{errors.stock}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Giảm giá (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) =>
                      handleChange("discountPercent", +e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Mô tả *
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.description ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                />
                {errors.description && (
                  <span className="text-xs text-red-500">
                    {errors.description}
                  </span>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isGift}
                  onChange={(e) => handleChange("isGift", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Box quà tặng
                </span>
              </label>
            </div>

            {/* Thời hạn */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Thời hạn hiệu lực
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => handleChange("validFrom", e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.validFrom ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  {errors.validFrom && (
                    <span className="text-xs text-red-500">
                      {errors.validFrom}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={form.validTo}
                    onChange={(e) => handleChange("validTo", e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.validTo ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  {errors.validTo && (
                    <span className="text-xs text-red-500">
                      {errors.validTo}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sản phẩm */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Sản phẩm trong box
              </h3>
              {errors.products && (
                <span className="text-xs text-red-500">{errors.products}</span>
              )}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_36px] gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500">
                  <span>Sản phẩm</span>
                  <span>Số lượng</span>
                  <span />
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {products.map((p, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_80px_36px] gap-2 px-3 py-2.5 items-center"
                    >
                      <select
                        value={p.productId}
                        onChange={(e) => handleSelectProduct(i, e.target.value)}
                        className="px-2.5 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">— Chọn sản phẩm —</option>
                        {availableProducts.map((ap) => (
                          <option key={ap._id} value={ap._id}>
                            {ap.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={p.quantity}
                        onChange={(e) =>
                          handleChangeProduct(i, "quantity", +e.target.value)
                        }
                        className="px-2.5 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleRemoveProduct(i)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={handleAddProduct}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-gray-50/50 dark:bg-gray-800/20 rounded-b-xl">
            <button
              onClick={() => router.push("/admin-box")}
              className="px-4 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
