"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Sửa đường dẫn import chuẩn Shadcn
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Sử dụng service file bạn đã cung cấp
import { getAllBoxesApi } from "@/app/services/api/boxService";
import { createPlanApi } from "@/app/services/api/subscribePlanService";

const EMPTY_ADDRESS = {
  address: "",
  district: "",
  city: "",
  country: "Vietnam",
  zipCode: "",
  phone: "",
};

const PLAN_LABELS = {
  "1_month": "1 Tháng",
  "3_months": "3 Tháng",
  "6_months": "6 Tháng",
};

const fmtPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val,
  );

export default function CreateSubscribePlanPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    userId: "",
    boxId: "",
    planType: "1_month",
    totalDeliveries: 1,
    discountPercent: 0,
    giftId: "",
  });
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS });
  const [boxes, setBoxes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    getAllBoxesApi()
      .then((res) => setBoxes(res.data || []))
      .catch(() => {});
  }, []);

  const selectedBox = boxes.find((b) => b._id === form.boxId);
  const computedPrice = selectedBox
    ? selectedBox.value * (1 - form.discountPercent / 100)
    : 0;

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };
  const setAddr = (f, v) => {
    setAddress((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [`addr_${f}`]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Bắt buộc";
    if (!form.userId.trim()) e.userId = "Bắt buộc";
    if (!form.boxId) e.boxId = "Vui lòng chọn box";
    if (form.totalDeliveries < 1) e.totalDeliveries = "Tối thiểu 1";
    if (!address.address.trim()) e.addr_address = "Bắt buộc";
    if (!address.district.trim()) e.addr_district = "Bắt buộc";
    if (!address.city.trim()) e.addr_city = "Bắt buộc";
    if (!address.phone.trim()) e.addr_phone = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await createPlanApi({
        ...form,
        shippingAddress: address,
      });
      router.push("/admin/subscribe-plans");
    } catch (e) {
      setApiError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb thuần Tailwind */}
        <nav className="flex mb-4 text-xs font-medium text-gray-500 dark:text-gray-400 gap-2 items-center">
          <span
            className="hover:text-foreground cursor-pointer"
            onClick={() => router.push("/admin")}
          >
            Admin
          </span>
          <ChevronRight size={12} />
          <span
            className="hover:text-foreground cursor-pointer"
            onClick={() => router.push("/admin/subscribe-plans")}
          >
            Subscribe Plans
          </span>
          <ChevronRight size={12} />
          <span className="text-foreground">Tạo mới</span>
        </nav>

        {/* Page Header thuần Tailwind */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Tạo Subscribe Plan mới
          </h1>
          <p className="text-sm text-muted-foreground">
            Tạo gói đăng ký nhận box định kỳ cho khách hàng
          </p>
        </div>

        {apiError && (
          <div className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <Card>
          <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
            {/* 1. Thông tin gói */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Thông tin gói
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Tên gói, khách hàng và cấu hình thời gian
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <Label>Tên gói *</Label>
                  <Input
                    placeholder="VD: Gói wellness 3 tháng"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500">{errors.name}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>User ID *</Label>
                  <Input
                    placeholder="MongoDB ObjectId của khách hàng"
                    value={form.userId}
                    onChange={(e) => set("userId", e.target.value)}
                  />
                  {errors.userId && (
                    <span className="text-xs text-red-500">
                      {errors.userId}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Loại gói *</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={form.planType}
                      onChange={(e) => set("planType", e.target.value)}
                    >
                      {Object.entries(PLAN_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Số lần giao hàng *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.totalDeliveries}
                      onChange={(e) => set("totalDeliveries", +e.target.value)}
                    />
                    {errors.totalDeliveries && (
                      <span className="text-xs text-red-500">
                        {errors.totalDeliveries}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Box & Giá */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Box & Giá
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Chọn box và tỷ lệ giảm giá
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <Label>Box *</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.boxId}
                    onChange={(e) => set("boxId", e.target.value)}
                  >
                    <option value="">— Chọn box —</option>
                    {boxes.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} —{" "}
                        {new Intl.NumberFormat("vi-VN").format(b.value)} ₫
                      </option>
                    ))}
                  </select>
                  {errors.boxId && (
                    <span className="text-xs text-red-500">{errors.boxId}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Giảm giá (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={form.discountPercent}
                      onChange={(e) => set("discountPercent", +e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Box quà tặng (ID)</Label>
                    <Input
                      placeholder="ObjectId box quà (tuỳ chọn)"
                      value={form.giftId}
                      onChange={(e) => set("giftId", e.target.value)}
                    />
                  </div>
                </div>

                {selectedBox && (
                  <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Giá gốc</span>
                      <span className="line-through">
                        {fmtPrice(selectedBox.value)}
                      </span>
                    </div>
                    {form.discountPercent > 0 && (
                      <div className="flex justify-between text-xs text-red-600">
                        <span>Giảm {form.discountPercent}%</span>
                        <span>
                          -
                          {fmtPrice(
                            (selectedBox.value * form.discountPercent) / 100,
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold border-t border-blue-200 pt-1.5 text-blue-800">
                      <span>Giá mỗi lần giao</span>
                      <span>{fmtPrice(computedPrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Địa chỉ giao hàng */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Địa chỉ giao hàng
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Địa chỉ nhận hàng của khách
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <Label>Địa chỉ *</Label>
                  <Input
                    placeholder="Số nhà, tên đường"
                    value={address.address}
                    onChange={(e) => setAddr("address", e.target.value)}
                  />
                  {errors.addr_address && (
                    <span className="text-xs text-red-500">
                      {errors.addr_address}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Quận / Huyện *</Label>
                    <Input
                      value={address.district}
                      onChange={(e) => setAddr("district", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Thành phố *</Label>
                    <Input
                      value={address.city}
                      onChange={(e) => setAddr("city", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Số điện thoại *</Label>
                    <Input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddr("phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-gray-50/50 rounded-b-xl">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/subscribe-plans")}
            >
              Huỷ
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarClock size={14} />
              )}
              {loading ? "Đang tạo..." : "Tạo gói đăng ký"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
