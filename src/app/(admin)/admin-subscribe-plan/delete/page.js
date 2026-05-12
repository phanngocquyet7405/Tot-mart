"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, Trash2, Ban, XCircle, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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

export default function DeleteSubscribePlanPage() {
  const router = useRouter();
  const { id } = useParams();

  const [plan, setPlan] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await planApi.getById(id);
        setPlan(res.data);
      } catch (err) {
        setApiError(err.response?.data?.message || err.message);
      } finally {
        setFetching(false);
      }
    }
    if (id) fetchPlan();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Xác nhận huỷ gói vào cuối kỳ thanh toán hiện tại?"))
      return;
    setCancelLoading(true);
    setApiError("");
    try {
      await planApi.cancel(id);
      toast.success("Huỷ gói vào cuối kỳ thành công!");
      router.push("/admin-subscribe-plan");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setApiError(errMsg);
      toast.error(errMsg);
      setCancelLoading(false);
    }
  };

  const handleCancelImmediately = async () => {
    if (
      !window.confirm("CẢNH BÁO: Gói sẽ dừng hoạt động ngay lập tức. Xác nhận?")
    )
      return;
    setCancelLoading(true);
    setApiError("");
    try {
      await planApi.cancelImmediately(id);
      toast.success("Huỷ gói ngay lập tức thành công!");
      router.push("/admin-subscribe-plan");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setApiError(errMsg);
      toast.error(errMsg);
      setCancelLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Hành động này sẽ xoá hoàn toàn dữ liệu. Bạn chắc chắn chứ?",
      )
    )
      return;
    setLoading(true);
    setApiError("");
    try {
      await planApi.delete(id);
      toast.success("Xoá gói thành công!");
      router.push("/admin-subscribe-plan");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setApiError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

  const progress =
    plan && plan.totalDeliveries > 0
      ? Math.round((plan.completeDeliveries / plan.totalDeliveries) * 100)
      : 0;

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-gray-400">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Quản lý Huỷ / Xoá
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Chọn hình thức chấm dứt gói đăng ký
          </p>
        </div>

        {apiError && (
          <div className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {!plan ? (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            Dữ liệu gói đăng ký không tồn tại hoặc đã bị xoá.
          </div>
        ) : (
          <>
            {/* Thông tin tóm tắt */}
            <Card className="mb-5">
              <CardContent className="p-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <CalendarClock
                      size={20}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {plan.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {PLAN_LABELS[plan.planType] || plan.planType} •{" "}
                      {fmtPrice(plan.price || 0)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    [
                      "Tiến độ",
                      `${plan.completeDeliveries}/${plan.totalDeliveries} lần`,
                    ],
                    ["Còn lại", `${plan.remainDeliveries} lần`],
                    ["Hết hạn kỳ", plan.currentPeriodEnd?.slice(0, 10) || "—"],
                    ["Khu vực", plan.shippingAddress?.city || "N/A"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5 font-bold">
                        {label}
                      </div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Tiến độ hoàn thành</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Huỷ — chỉ hiện khi active */}
            {plan.status === "active" && (
              <div className="space-y-3 mb-5">
                <Card className="border-l-4 border-l-amber-400">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Ban size={18} className="text-amber-500 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          Huỷ vào cuối kỳ
                        </h3>
                        <p className="text-xs text-gray-500 my-2 leading-relaxed">
                          Gói vẫn hoạt động đến hết{" "}
                          <strong>{plan.currentPeriodEnd?.slice(0, 10)}</strong>
                          . Sau đó sẽ không tự động gia hạn.
                        </p>
                        <button
                          onClick={handleCancel}
                          disabled={cancelLoading}
                          className="px-3 py-1.5 text-xs rounded-md border border-amber-200 text-amber-600 hover:bg-amber-50 disabled:opacity-50 transition-colors"
                        >
                          {cancelLoading
                            ? "Đang xử lý..."
                            : "Xác nhận huỷ cuối kỳ"}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <XCircle size={18} className="text-red-500 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          Huỷ ngay lập tức
                        </h3>
                        <p className="text-xs text-gray-500 my-2 leading-relaxed">
                          Dừng mọi hoạt động giao hàng ngay bây giờ. Tiền còn dư
                          cần xử lý thủ công.
                        </p>
                        <button
                          onClick={handleCancelImmediately}
                          disabled={cancelLoading}
                          className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {cancelLoading ? "Đang xử lý..." : "Huỷ gói ngay"}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Xoá vĩnh viễn */}
            <Card className="bg-red-50/30 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Trash2 size={18} className="text-red-600 mt-1" />
                  <div>
                    <h3 className="text-sm font-bold text-red-700 dark:text-red-400">
                      Vùng nguy hiểm: Xoá vĩnh viễn
                    </h3>
                    <p className="text-xs text-red-600/70 mt-1">
                      Chỉ nên thực hiện khi gói tạo sai hoặc dữ liệu rác. Mọi
                      lịch sử giao hàng sẽ bị mất.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-red-100 dark:border-red-900/20">
                  <button
                    onClick={() => router.back()}
                    disabled={loading || cancelLoading}
                    className="px-4 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    {loading ? "Đang xoá..." : "Xoá toàn bộ dữ liệu"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
