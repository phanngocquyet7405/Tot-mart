"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  FormSection,
  PageHeader,
  Breadcrumb,
  Alert,
  Spinner,
  fmtPrice,
} from "@/components/ui";
import { boxApi } from "@/lib/api";
import { Plus, Trash2, Save } from "lucide-react";

export default function UpdateBoxPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ─── Load box ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await boxApi.getById(id);
        const box = res.data;
        setForm({
          name: box.name,
          stock: box.stock,
          descriptions: box.descriptions,
          validFrom: box.validFrom?.slice(0, 10) || "",
          validTo: box.validTo?.slice(0, 10) || "",
          discountPercent: box.discountPercent || 0,
          isGift: box.isGift || false,
        });
        setProducts(
          (box.products || []).map((p) => ({
            name: p.name || "",
            quantity: p.quantity || 1,
            price: p.price || 0,
          })),
        );
      } catch (e) {
        setApiError(e.message);
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const setProduct = (idx, field, value) => {
    setProducts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addProduct = () =>
    setProducts((p) => [...p, { name: "", quantity: 1, price: 0 }]);
  const removeProduct = (idx) =>
    setProducts((p) => p.filter((_, i) => i !== idx));

  const computedValue = (() => {
    if (!form) return 0;
    const raw = products.reduce((s, p) => s + p.price * p.quantity, 0);
    return form.discountPercent > 0
      ? raw * (1 - form.discountPercent / 100)
      : raw;
  })();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Tên box không được để trống";
    if (form.stock < 1) e.stock = "Tồn kho phải lớn hơn 0";
    if (!form.descriptions.trim()) e.descriptions = "Mô tả không được để trống";
    if (!form.validFrom) e.validFrom = "Vui lòng chọn ngày bắt đầu";
    if (!form.validTo) e.validTo = "Vui lòng chọn ngày kết thúc";
    if (form.validFrom >= form.validTo)
      e.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
    products.forEach((p, i) => {
      if (!p.name.trim()) e[`product_${i}_name`] = "Bắt buộc";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await boxApi.update(id, {
        ...form,
        products,
        value: computedValue,
        totalItem: products.length,
      });
      setSuccess(true);
      setTimeout(() => router.push("/admin/boxes"), 1200);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Spinner size={20} />
          <span className="text-sm">Đang tải thông tin box...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Boxes", href: "/admin/boxes" },
            { label: "Chỉnh sửa" },
          ]}
        />
        <PageHeader
          title="Chỉnh sửa Box"
          description={form ? `Đang sửa: ${form.name}` : ""}
        />

        {apiError && (
          <Alert type="error" className="mb-5">
            <span>{apiError}</span>
          </Alert>
        )}
        {success && (
          <Alert type="success" className="mb-5">
            <span>Cập nhật thành công! Đang chuyển hướng...</span>
          </Alert>
        )}

        {!form ? (
          <Alert type="error">
            <span>Không tìm thấy box</span>
          </Alert>
        ) : (
          <Card>
            <CardBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Thông tin cơ bản */}
              <FormSection
                title="Thông tin cơ bản"
                description="Tên, tồn kho và mô tả"
              >
                <Input
                  label="Tên box *"
                  value={form.name}
                  error={errors.name}
                  onChange={(e) => set("name", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Tồn kho *"
                    type="number"
                    min={1}
                    value={form.stock}
                    error={errors.stock}
                    onChange={(e) => set("stock", +e.target.value)}
                  />
                  <Input
                    label="Giảm giá (%)"
                    type="number"
                    min={0}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) => set("discountPercent", +e.target.value)}
                  />
                </div>
                <Textarea
                  label="Mô tả *"
                  rows={3}
                  value={form.descriptions}
                  error={errors.descriptions}
                  onChange={(e) => set("descriptions", e.target.value)}
                />
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isGift}
                    onChange={(e) => set("isGift", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Box quà tặng
                  </span>
                </label>
              </FormSection>

              {/* Thời hạn */}
              <FormSection
                title="Thời hạn hiệu lực"
                description="Khoảng thời gian box được phép bán"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Ngày bắt đầu *"
                    type="date"
                    value={form.validFrom}
                    error={errors.validFrom}
                    onChange={(e) => set("validFrom", e.target.value)}
                  />
                  <Input
                    label="Ngày kết thúc *"
                    type="date"
                    value={form.validTo}
                    error={errors.validTo}
                    onChange={(e) => set("validTo", e.target.value)}
                  />
                </div>
              </FormSection>

              {/* Sản phẩm */}
              <FormSection
                title="Sản phẩm trong box"
                description="Thêm hoặc xoá sản phẩm"
              >
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr_80px_100px_36px] gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500">
                    <span>Tên sản phẩm</span>
                    <span>Số lượng</span>
                    <span>Đơn giá (₫)</span>
                    <span />
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {products.map((p, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_80px_100px_36px] gap-2 px-3 py-2.5 items-center"
                      >
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) =>
                            setProduct(i, "name", e.target.value)
                          }
                          className={`px-2.5 py-1.5 text-sm rounded-md border bg-white dark:bg-gray-900 dark:text-gray-100
                            focus:outline-none focus:ring-1 focus:ring-blue-500
                            ${errors[`product_${i}_name`] ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                        />
                        <input
                          type="number"
                          min={1}
                          value={p.quantity}
                          onChange={(e) =>
                            setProduct(i, "quantity", +e.target.value)
                          }
                          className="px-2.5 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          min={0}
                          value={p.price}
                          onChange={(e) =>
                            setProduct(i, "price", +e.target.value)
                          }
                          className="px-2.5 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeProduct(i)}
                          disabled={products.length === 1}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50
                            dark:hover:bg-red-900/20 transition-colors disabled:opacity-30"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="ghost" size="sm" onClick={addProduct}>
                      <Plus size={13} />
                      Thêm sản phẩm
                    </Button>
                  </div>
                </div>

                {computedValue > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-xs text-blue-700 dark:text-blue-400">
                      Giá trị box{" "}
                      {form.discountPercent > 0
                        ? `(sau giảm ${form.discountPercent}%)`
                        : ""}
                    </span>
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                      {fmtPrice(computedValue)}
                    </span>
                  </div>
                )}
              </FormSection>
            </CardBody>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-gray-50/50 dark:bg-gray-800/20 rounded-b-xl">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/boxes")}
              >
                Huỷ
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
              >
                <Save size={14} />
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
