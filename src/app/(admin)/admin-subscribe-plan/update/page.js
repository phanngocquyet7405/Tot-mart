"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Badge,
  FormSection,
  PageHeader,
  Breadcrumb,
  Alert,
  Spinner,
  fmtPrice,
  PLAN_LABELS,
  STATUS_CONFIG,
} from "@/components/ui";
import { planApi, boxApi } from "@/lib/api";
import { Save } from "lucide-react";

export default function UpdateSubscribePlanPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [address, setAddress] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([planApi.getById(id), boxApi.getAll()])
      .then(([planRes, boxRes]) => {
        const plan = planRes.data;
        setForm({
          name: plan.name,
          userId: plan.userId,
          boxId: plan.boxId,
          planType: plan.planType,
          totalDeliveries: plan.totalDeliveries,
          discountPercent: plan.discountPercent || 0,
          status: plan.status,
          cancelAtPeriodEnd: plan.cancelAtPeriodEnd,
        });
        setAddress({ ...(plan.shippingAddress || {}) });
        setBoxes(boxRes.data || []);
      })
      .catch((e) => setApiError(e.message))
      .finally(() => setFetching(false));
  }, [id]);

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };
  const setAddr = (f, v) => {
    setAddress((p) => ({ ...p, [f]: v }));
  };

  const selectedBox = boxes.find((b) => b._id === form?.boxId);
  const computedPrice =
    selectedBox && form
      ? selectedBox.value * (1 - (form.discountPercent || 0) / 100)
      : 0;

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Bắt buộc";
    if (!form.boxId) e.boxId = "Vui lòng chọn box";
    if (form.totalDeliveries < 1) e.totalDeliveries = "Tối thiểu 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await planApi.update(id, { ...form, shippingAddress: address });
      setSuccess(true);
      setTimeout(() => router.push("/admin/subscribe-plans"), 1200);
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
          <span className="text-sm">Đang tải thông tin gói...</span>
        </div>
      </div>
    );
  }

  const statusCfg = form ? STATUS_CONFIG[form.status] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Subscribe Plans", href: "/admin/subscribe-plans" },
            { label: "Chỉnh sửa" },
          ]}
        />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Chỉnh sửa Subscribe Plan
            </h1>
            {form && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {form.name}
                </p>
                {statusCfg && (
                  <Badge color={statusCfg.color}>{statusCfg.label}</Badge>
                )}
                {form.cancelAtPeriodEnd && (
                  <Badge color="amber">Huỷ cuối kỳ</Badge>
                )}
              </div>
            )}
          </div>
        </div>

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
            <span>Không tìm thấy gói đăng ký</span>
          </Alert>
        ) : (
          <Card>
            <CardBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Thông tin gói */}
              <FormSection
                title="Thông tin gói"
                description="Tên, khách hàng và loại gói"
              >
                <Input
                  label="Tên gói *"
                  value={form.name}
                  error={errors.name}
                  onChange={(e) => set("name", e.target.value)}
                />
                <Input
                  label="User ID"
                  value={form.userId}
                  onChange={(e) => set("userId", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Loại gói"
                    value={form.planType}
                    onChange={(e) => set("planType", e.target.value)}
                  >
                    {Object.entries(PLAN_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Số lần giao hàng"
                    type="number"
                    min={1}
                    value={form.totalDeliveries}
                    error={errors.totalDeliveries}
                    onChange={(e) => set("totalDeliveries", +e.target.value)}
                  />
                </div>
              </FormSection>

              {/* Box & Giá */}
              <FormSection
                title="Box & Giá"
                description="Box đang đăng ký và giảm giá"
              >
                <Select
                  label="Box *"
                  value={form.boxId}
                  error={errors.boxId}
                  onChange={(e) => set("boxId", e.target.value)}
                >
                  <option value="">— Chọn box —</option>
                  {boxes.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} —{" "}
                      {new Intl.NumberFormat("vi-VN").format(b.value)} ₫
                    </option>
                  ))}
                </Select>
                <Input
                  label="Giảm giá (%)"
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPercent}
                  onChange={(e) => set("discountPercent", +e.target.value)}
                />

                {selectedBox && computedPrice > 0 && (
                  <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-blue-700 dark:text-blue-300">
                        Giá mỗi lần giao
                      </span>
                      <span className="text-blue-800 dark:text-blue-200">
                        {fmtPrice(computedPrice)}
                      </span>
                    </div>
                  </div>
                )}
              </FormSection>

              {/* Trạng thái */}
              <FormSection
                title="Trạng thái"
                description="Trạng thái hiện tại của gói"
              >
                <Select
                  label="Trạng thái"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="cancelled">Đã huỷ</option>
                  <option value="expired">Hết hạn</option>
                </Select>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.cancelAtPeriodEnd}
                    onChange={(e) => set("cancelAtPeriodEnd", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Huỷ vào cuối kỳ thanh toán
                  </span>
                </label>
              </FormSection>

              {/* Địa chỉ giao hàng */}
              {address && (
                <FormSection
                  title="Địa chỉ giao hàng"
                  description="Cập nhật địa chỉ nhận hàng"
                >
                  <Input
                    label="Địa chỉ"
                    value={address.address || ""}
                    onChange={(e) => setAddr("address", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Quận / Huyện"
                      value={address.district || ""}
                      onChange={(e) => setAddr("district", e.target.value)}
                    />
                    <Input
                      label="Thành phố"
                      value={address.city || ""}
                      onChange={(e) => setAddr("city", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Quốc gia"
                      value={address.country || ""}
                      onChange={(e) => setAddr("country", e.target.value)}
                    />
                    <Input
                      label="Mã bưu chính"
                      value={address.zipCode || ""}
                      onChange={(e) => setAddr("zipCode", e.target.value)}
                    />
                    <Input
                      label="Số điện thoại"
                      type="tel"
                      value={address.phone || ""}
                      onChange={(e) => setAddr("phone", e.target.value)}
                    />
                  </div>
                </FormSection>
              )}
            </CardBody>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-gray-50/50 dark:bg-gray-800/20 rounded-b-xl">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/subscribe-plans")}
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
