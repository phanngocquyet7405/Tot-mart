"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AlertCircle,
  Save,
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        setBoxes(boxRes.data?.boxes || boxRes.data || []);
      } catch (err) {
        setApiError(err.response?.data?.message || err.message);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [id]);

  const selectedBox = useMemo(
    () => boxes.find((b) => b._id === form?.boxId),
    [boxes, form?.boxId],
  );
  const computedPrice = useMemo(
    () =>
      selectedBox
        ? selectedBox.value * (1 - (form.discountPercent || 0) / 100)
        : 0,
    [selectedBox, form?.discountPercent],
  );

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) return setErrors({ name: "Tên gói là bắt buộc" });
    setLoading(true);
    try {
      await planApi.update(id, { ...form, shippingAddress: address });
      toast.success("Cập nhật thông tin gói thành công!");
      router.push("/admin-subscribe-plan");
    } catch (err) {
      setApiError(err.response?.data?.message || "Lỗi cập nhật");
      toast.error("Không thể cập nhật");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="p-20 text-center animate-pulse text-gray-400">
        Đang tải dữ liệu gói...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cấu hình gói đăng ký
            </h1>
            <p className="text-xs text-gray-500 font-mono">UUID: {id}</p>
          </div>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3 items-center">
            <AlertCircle size={20} /> {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info */}
            <Card className="shadow-sm border-gray-200/60">
              <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Package size={18} className="text-blue-500" /> Thông tin sản
                  phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Tên gói hiển thị
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Loại Box
                      </label>
                      <select
                        value={form.boxId}
                        onChange={(e) => set("boxId", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border bg-white appearance-none"
                      >
                        <option value="">Chọn loại box</option>
                        {boxes.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Chu kỳ
                      </label>
                      <select
                        value={form.planType}
                        onChange={(e) => set("planType", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border bg-white"
                      >
                        {Object.entries(PLAN_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Info */}
            <Card className="shadow-sm border-gray-200/60">
              <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" /> Địa chỉ giao
                  hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Địa chỉ cụ thể
                    </label>
                    <input
                      value={address.address || ""}
                      onChange={(e) =>
                        setAddress({ ...address, address: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-orange-500/20 outline-none"
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Quận / Huyện
                    </label>
                    <input
                      value={address.district || ""}
                      onChange={(e) =>
                        setAddress({ ...address, district: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Thành phố
                    </label>
                    <input
                      value={address.city || ""}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Pricing Summary Card */}
            <Card className="bg-blue-600 text-white border-none shadow-lg shadow-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <CreditCard size={16} />{" "}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Tóm tắt thanh toán
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm opacity-90">
                    <span>Giá gốc</span>
                    <span>{fmtPrice(selectedBox?.value || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-200">
                    <span>Chiết khấu</span>
                    <span>-{form.discountPercent}%</span>
                  </div>
                  <div className="pt-3 border-t border-blue-500/50 flex justify-between items-end">
                    <span className="text-sm font-medium">Giá cuối/lần</span>
                    <span className="text-2xl font-bold">
                      {fmtPrice(computedPrice)}
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <label className="text-xs font-semibold opacity-70 uppercase">
                    Điều chỉnh chiết khấu (%)
                  </label>
                  <input
                    type="number"
                    value={form.discountPercent}
                    onChange={(e) => set("discountPercent", +e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white outline-none focus:bg-white/20"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trạng thái gói</span>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${form.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {form.status}
                  </span>
                </div>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.cancelAtPeriodEnd}
                    onChange={(e) => set("cancelAtPeriodEnd", e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-xs text-gray-600 leading-tight">
                    Dừng gia hạn khi hết chu kỳ thanh toán
                  </span>
                </label>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50 shadow-md transition-all"
                >
                  <Save size={18} />{" "}
                  {loading ? "Đang lưu..." : "Cập nhật thay đổi"}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
