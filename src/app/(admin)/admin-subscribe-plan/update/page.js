"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { getAllBoxesApi } from "@/app/services/api/boxService";
import { planApi } from "@/app/services/api/subscribePlanService";

const fmtPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val,
  );

const PLAN_LABELS = {
  "1_month": "1 Tháng",
  "3_months": "3 Tháng",
  "6_months": "6 Tháng",
};

export default function UpdateSubscribePlanPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [address, setAddress] = useState({});
  const [boxes, setBoxes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [planRes, boxRes] = await Promise.all([
          planApi.getById(id),
          getAllBoxesApi(),
        ]);
        const plan = planRes.data;
        setForm({
          name: plan.name || "",
          userId: plan.userId || "",
          boxId: plan.boxId || "",
          planType: plan.planType || "1_month",
          totalDeliveries: plan.totalDeliveries || 1,
          discountPercent: plan.discountPercent || 0,
          status: plan.status || "active",
          cancelAtPeriodEnd: plan.cancelAtPeriodEnd || false,
        });
        setAddress(plan.shippingAddress || {});
        if (boxRes.data?.boxes) setBoxes(boxRes.data.boxes);
        else if (boxRes.data) setBoxes(boxRes.data);
      } catch (err) {
        setApiError(err.response?.data?.message || err.message);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [id]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  const setAddr = (field, value) =>
    setAddress((prev) => ({ ...prev, [field]: value }));

  const selectedBox = boxes.find((b) => b._id === form?.boxId);
  const computedPrice =
    selectedBox && form
      ? selectedBox.value * (1 - (form.discountPercent || 0) / 100)
      : 0;

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Tên gói không được để trống";
    if (!form.boxId) e.boxId = "Vui lòng chọn một loại box";
    if (form.totalDeliveries < 1)
      e.totalDeliveries = "Số lần giao ít nhất là 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      await planApi.update(id, { ...form, shippingAddress: address });
      toast.success("Cập nhật thành công!");
      router.push("/admin-subscribe-plan");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-gray-400">Đang tải thông tin gói...</span>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-red-500">
          Không tìm thấy dữ liệu gói đăng ký
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Chỉnh sửa Subscribe Plan
          </h1>
          <p className="text-sm text-gray-500 mt-1">ID: {id?.slice(-6)}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Tên gói *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.name ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500">{errors.name}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={form.userId}
                    disabled
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 opacity-70"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Tần suất
                  </label>
                  <select
                    value={form.planType}
                    onChange={(e) => set("planType", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.entries(PLAN_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Tổng số lần giao
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.totalDeliveries}
                    onChange={(e) => set("totalDeliveries", +e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.totalDeliveries ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  {errors.totalDeliveries && (
                    <span className="text-xs text-red-500">
                      {errors.totalDeliveries}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Box & Giá */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Cấu hình sản phẩm & Giá
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Chọn Box *
                </label>
                <select
                  value={form.boxId}
                  onChange={(e) => set("boxId", e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-md border bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.boxId ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
                >
                  <option value="">— Chọn box —</option>
                  {boxes.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({fmtPrice(b.value)})
                    </option>
                  ))}
                </select>
                {errors.boxId && (
                  <span className="text-xs text-red-500">{errors.boxId}</span>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Chiết khấu (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPercent}
                  onChange={(e) => set("discountPercent", +e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {selectedBox && (
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">
                        Giá áp dụng
                      </p>
                      <p className="text-lg font-black text-blue-700 dark:text-blue-300">
                        {fmtPrice(computedPrice)}{" "}
                        <span className="text-xs font-normal">/ lần giao</span>
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      Giá gốc: <del>{fmtPrice(selectedBox.value)}</del>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trạng thái */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Trạng thái & Gia hạn
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="cancelled">Đã huỷ</option>
                  <option value="expired">Hết hạn</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={form.cancelAtPeriodEnd}
                  onChange={(e) => set("cancelAtPeriodEnd", e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Huỷ vào cuối kỳ
                  </span>
                  <p className="text-xs text-gray-500">
                    Gói sẽ không tự động gia hạn sau khi hết kỳ thanh toán.
                  </p>
                </div>
              </label>
            </div>

            {/* Địa chỉ */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Địa chỉ giao hàng
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Số nhà, tên đường
                </label>
                <input
                  type="text"
                  value={address.address || ""}
                  onChange={(e) => setAddr("address", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    value={address.district || ""}
                    onChange={(e) => setAddr("district", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    value={address.city || ""}
                    onChange={(e) => setAddr("city", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={address.phone || ""}
                    onChange={(e) => setAddr("phone", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Mã bưu chính
                  </label>
                  <input
                    type="text"
                    value={address.zipCode || ""}
                    onChange={(e) => setAddr("zipCode", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-gray-50/50 dark:bg-gray-800/20 rounded-b-xl">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Huỷ bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Save size={14} />
              {loading ? "Đang xử lý..." : "Cập nhật ngay"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
