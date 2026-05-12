"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  PageHeader,
  Breadcrumb,
  Alert,
  Spinner,
  Badge,
  fmtPrice,
  fmtDate,
  PLAN_LABELS,
  STATUS_CONFIG,
} from "@/components/ui";
import { planApi } from "@/lib/api";
import {
  Trash2,
  AlertTriangle,
  Ban,
  XCircle,
  CalendarClock,
} from "lucide-react";

export default function DeleteSubscribePlanPage() {
  const router = useRouter();
  const { id } = useParams();

  const [plan, setPlan] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [action, setAction] = useState(null); // 'cancel-end' | 'cancel-now' | 'delete'

  useEffect(() => {
    (async () => {
      try {
        const res = await planApi.getById(id);
        setPlan(res.data);
      } catch (e) {
        setApiError(e.message);
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await planApi.cancel(id);
      router.push("/admin/subscribe-plans");
    } catch (e) {
      setApiError(e.message);
      setCancelLoading(false);
    }
  };

  const handleCancelImmediately = async () => {
    setCancelLoading(true);
    try {
      await planApi.cancelImmediately(id);
      router.push("/admin/subscribe-plans");
    } catch (e) {
      setApiError(e.message);
      setCancelLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await planApi.delete(id);
      router.push("/admin/subscribe-plans");
    } catch (e) {
      setApiError(e.message);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Spinner size={20} />
          <span className="text-sm">Đang tải...</span>
        </div>
      </div>
    );
  }

  const statusCfg = plan ? STATUS_CONFIG[plan.status] : null;
  const progress =
    plan && plan.totalDeliveries > 0
      ? Math.round((plan.completeDeliveries / plan.totalDeliveries) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-lg mx-auto">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Subscribe Plans", href: "/admin/subscribe-plans" },
            { label: "Huỷ / Xoá" },
          ]}
        />
        <PageHeader
          title="Huỷ / Xoá Subscribe Plan"
          description="Chọn hành động phù hợp"
        />

        {apiError && (
          <Alert type="error" className="mb-5">
            <span>{apiError}</span>
          </Alert>
        )}

        {!plan ? (
          <Alert type="error">
            <span>Không tìm thấy gói đăng ký</span>
          </Alert>
        ) : (
          <>
            {/* Thông tin plan */}
            <Card className="mb-5">
              <CardBody>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <CalendarClock size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {plan.name}
                      </span>
                      {statusCfg && (
                        <Badge color={statusCfg.color}>{statusCfg.label}</Badge>
                      )}
                      {plan.cancelAtPeriodEnd && (
                        <Badge color="amber">Huỷ cuối kỳ</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {PLAN_LABELS[plan.planType]} · {fmtPrice(plan.price)}/lần
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    [
                      "Giao hàng",
                      `${plan.completeDeliveries}/${plan.totalDeliveries}`,
                    ],
                    ["Còn lại", `${plan.remainDeliveries} lần`],
                    ["Kết thúc kỳ", fmtDate(plan.currentPeriodEnd)],
                    ["Thành phố", plan.shippingAddress?.city || "—"],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2"
                    >
                      <div className="text-xs text-gray-400 mb-0.5">{l}</div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Tiến độ giao hàng</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Các lựa chọn hành động */}
            {plan.status === "active" && (
              <>
                {/* Huỷ cuối kỳ */}
                <Card className="mb-3">
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Ban
                          size={15}
                          className="text-amber-700 dark:text-amber-400"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Huỷ vào cuối kỳ
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          Khách hàng vẫn nhận đủ hàng đến hết kỳ thanh toán hiện
                          tại ({fmtDate(plan.currentPeriodEnd)}) rồi mới dừng.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          loading={cancelLoading}
                        >
                          <Ban size={13} />
                          Huỷ vào cuối kỳ
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Huỷ ngay */}
                <Card className="mb-3">
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <XCircle
                          size={15}
                          className="text-red-700 dark:text-red-400"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Huỷ ngay lập tức
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          Dừng tất cả các lần giao hàng còn lại ngay bây giờ.
                          Gói sẽ chuyển sang trạng thái Đã huỷ.
                        </p>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleCancelImmediately}
                          loading={cancelLoading}
                        >
                          <XCircle size={13} />
                          Huỷ ngay
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}

            {/* Xoá hoàn toàn */}
            <Card>
              <CardBody>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-gray-100 flex items-center justify-center shrink-0">
                    <Trash2
                      size={15}
                      className="text-white dark:text-gray-900"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Xoá vĩnh viễn
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Xoá toàn bộ dữ liệu gói khỏi hệ thống. Không thể hoàn tác.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                  <AlertTriangle
                    size={13}
                    className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-red-700 dark:text-red-400">
                    Chỉ xoá khi gói đã bị huỷ hoặc hết hạn. Xoá gói đang hoạt
                    động có thể ảnh hưởng đến đơn hàng.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/admin/subscribe-plans")}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={loading}
                  >
                    <Trash2 size={14} />
                    {loading ? "Đang xoá..." : "Xoá vĩnh viễn"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
