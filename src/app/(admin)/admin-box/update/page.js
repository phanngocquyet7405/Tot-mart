"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  adjustBoxStockApi,
  getAdminBoxByIdApi,
  updateBoxApi,
} from "@/app/services/api/boxService";
import {
  BaseDialog,
  BaseDialogBody,
  BaseDialogFooter,
  BaseDialogHeader,
} from "../../components/SubscribePlans/PlanTemplate/BaseDialog.jsx";
import { getAllProductsApi } from "@/app/services/api/productServices";
import RichTextEditor from "../../components/ui/RichTextEditor";

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
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockDelta, setStockDelta] = useState("");
  const [stockReason, setStockReason] = useState("");
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);
  const stockDeltaNumber = Number(stockDelta);
  const stockCurrent = Number(form.stock) || 0;
  const stockDeltaValid =
    stockDelta.trim() !== "" &&
    Number.isInteger(stockDeltaNumber) &&
    stockDeltaNumber !== 0;
  const stockNextPreview = stockCurrent + stockDeltaNumber;
  const stockWouldBeNegative = stockDeltaValid && stockNextPreview < 0;
  const canSubmitStockAdjust =
    stockDeltaValid && !stockWouldBeNegative && !isAdjustingStock;

  useEffect(() => {
    async function fetchData() {
      try {
        const [boxRes, productsRes] = await Promise.all([
          getAdminBoxByIdApi(id),
          getAllProductsApi(),
        ]);
        const box = boxRes.data;
        setForm({
          name: box.name || "",
          stock: box.stock || 1,
          description: box.descriptions || "",
          validFrom: box.validFrom?.slice(0, 10) || "",
          validTo: box.validTo?.slice(0, 10) || "",
          discountPercent: box.discountPercent || 0,
          isGift: box.isGift || false,
        });
        setProducts(
          (box.products || []).map((p) => ({
            productId: p.productId?._id || p.productId || "",
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

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    const delta = Number(stockDelta);
    const currentStock = Number(form.stock) || 0;
    if (!canSubmitStockAdjust) return;
    setIsAdjustingStock(true);
    try {
      const res = await adjustBoxStockApi(id, {
        delta,
        ...(stockReason.trim() ? { reason: stockReason.trim() } : {}),
      });
      const nextStock = res.data?.data?.stock ?? res.data?.stock ?? currentStock + delta;
      setForm((prev) => ({ ...prev, stock: nextStock }));
      setStockDialogOpen(false);
      setStockDelta("");
      setStockReason("");
      toast.success(res.data?.message || "Điều chỉnh tồn kho thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Điều chỉnh tồn kho thất bại");
    } finally {
      setIsAdjustingStock(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = "Tên box là bắt buộc";
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
      formData.append("descriptions", form.description.trim());
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
          formData.append(`products[${index}][productId]`, p.productId);
          formData.append(`products[${index}][quantity]`, String(p.quantity || 1));
        });

      await updateBoxApi(id, formData);
      toast.success("Cập nhật combo thành công!");
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
      <div className="min-h-screen bg-muted/30 dark:bg-background flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Đang tải thông tin box...</span>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-muted/30 dark:bg-background flex items-center justify-center">
        <span className="text-sm text-destructive-text">Không tìm thấy combo</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground dark:text-foreground">
            Chỉnh sửa Box
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Đang sửa: {form.name}</p>
        </div>

        {apiError && (
          <div className="mb-5 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive-text flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="whitespace-pre-wrap">{apiError}</span>
          </div>
        )}

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground dark:text-foreground">
                Thông tin cơ bản
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground dark:text-muted-foreground">
                  Tên box *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-card dark:text-foreground focus:outline-none focus:ring-1 focus:ring-primary ${errors.name ? "border-destructive/50" : "border-border dark:border-border"}`}
                />
                {errors.name && (
                  <span className="text-xs text-destructive-text">{errors.name}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground dark:text-muted-foreground">
                    Tồn kho *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={form.stock}
                      readOnly
                      aria-label="Tồn kho hiện tại"
                      className="w-full px-3 py-2 text-sm rounded-md border border-border dark:border-border bg-muted dark:bg-muted dark:text-foreground"
                    />
                    <button type="button" onClick={() => setStockDialogOpen(true)} className="shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/30 dark:border-border dark:text-muted-foreground dark:hover:bg-muted">
                      Điều chỉnh
                    </button>
                  </div>
                  {errors.stock && (
                    <span className="text-xs text-destructive-text">{errors.stock}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground dark:text-muted-foreground">
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
                    className="w-full px-3 py-2 text-sm rounded-md border border-border dark:border-border bg-white dark:bg-card dark:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground dark:text-muted-foreground">
                  Mô tả *
                </label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => handleChange("description", html)}
                  placeholder="Mô tả chi tiết box..."
                  error={errors.description}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isGift}
                  onChange={(e) => handleChange("isGift", e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground dark:text-muted-foreground">
                  Box quà tặng
                </span>
              </label>
            </div>

            {/* Thời hạn */}
            <div className="space-y-4 pt-4 border-t border-border dark:border-border">
              <h3 className="text-sm font-medium text-foreground dark:text-foreground">
                Thời hạn hiệu lực
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground dark:text-muted-foreground">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => handleChange("validFrom", e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-card dark:text-foreground focus:outline-none focus:ring-1 focus:ring-primary ${errors.validFrom ? "border-destructive/50" : "border-border dark:border-border"}`}
                  />
                  {errors.validFrom && (
                    <span className="text-xs text-destructive-text">
                      {errors.validFrom}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground dark:text-muted-foreground">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={form.validTo}
                    onChange={(e) => handleChange("validTo", e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-card dark:text-foreground focus:outline-none focus:ring-1 focus:ring-primary ${errors.validTo ? "border-destructive/50" : "border-border dark:border-border"}`}
                  />
                  {errors.validTo && (
                    <span className="text-xs text-destructive-text">
                      {errors.validTo}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sản phẩm */}
            <div className="space-y-4 pt-4 border-t border-border dark:border-border">
              <h3 className="text-sm font-medium text-foreground dark:text-foreground">
                Sản phẩm trong box
              </h3>
              {errors.products && (
                <span className="text-xs text-destructive-text">{errors.products}</span>
              )}
              <div className="border border-border dark:border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_36px] gap-2 px-3 py-2 bg-muted/30 dark:bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span>Sản phẩm</span>
                  <span>Số lượng</span>
                  <span />
                </div>
                <div className="divide-y divide-border dark:divide-border">
                  {products.map((p, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_80px_36px] gap-2 px-3 py-2.5 items-center"
                    >
                      <select
                        value={p.productId}
                        onChange={(e) => handleSelectProduct(i, e.target.value)}
                        className="px-2.5 py-1.5 text-sm rounded-md border border-border dark:border-border bg-white dark:bg-card dark:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                        className="px-2.5 py-1.5 text-sm rounded-md border border-border dark:border-border bg-white dark:bg-card dark:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        onClick={() => handleRemoveProduct(i)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive-text hover:bg-destructive/10 hover:bg-destructive/10 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-border dark:border-border">
                  <button
                    onClick={handleAddProduct}
                    className="text-sm text-primary hover:text-primary font-medium"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="px-6 py-4 border-t border-border dark:border-border flex justify-between bg-muted/30/50 dark:bg-muted/20 rounded-b-xl">
            <button
              onClick={() => router.push("/admin-box")}
              className="px-4 py-2 text-sm rounded-md border border-border dark:border-border text-foreground dark:text-muted-foreground hover:bg-muted/30 dark:hover:bg-muted transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </Card>
      </div>

      <BaseDialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <BaseDialogHeader title="Điều chỉnh tồn kho" subtitle={`Tồn kho hiện tại: ${form.stock}`} />
        <form onSubmit={handleAdjustStock}>
          <BaseDialogBody className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">Thay đổi số lượng
              <input type="number" step="1" value={stockDelta} onChange={(e) => setStockDelta(e.target.value)} placeholder="Ví dụ: 10 hoặc -3" required className="rounded-md border border-border px-3 py-2 dark:border-border dark:bg-card" />
            </label>
            <p
              className={`text-sm ${stockWouldBeNegative ? "text-destructive-text" : "text-muted-foreground dark:text-muted-foreground"}`}
            >
              {!stockDeltaValid
                ? "Nhập số nguyên khác 0 (số âm để giảm tồn kho)"
                : stockWouldBeNegative
                  ? `Không thể giảm quá tồn kho hiện tại (${stockCurrent})`
                  : `Tồn kho sau điều chỉnh: ${stockNextPreview}`}
            </p>
            <label className="flex flex-col gap-2 text-sm font-medium">Lý do (không bắt buộc)
              <input value={stockReason} onChange={(e) => setStockReason(e.target.value)} placeholder="Nhập lý do điều chỉnh" className="rounded-md border border-border px-3 py-2 dark:border-border dark:bg-card" />
            </label>
          </BaseDialogBody>
          <BaseDialogFooter>
            <button type="button" onClick={() => setStockDialogOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm dark:border-border">Hủy</button>
            <button type="submit" disabled={!canSubmitStockAdjust} className="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:opacity-50">{isAdjustingStock ? "Đang lưu..." : "Xác nhận"}</button>
          </BaseDialogFooter>
        </form>
      </BaseDialog>
    </div>
  );
}
