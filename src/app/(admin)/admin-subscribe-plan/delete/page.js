"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AlertTriangle,
  Trash2,
  Ban,
  XCircle,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { planApi } from "@/app/services/api/subscribePlanService";

export default function DeleteSubscribePlanPage() {
  const router = useRouter();
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await planApi.getById(id);
        setPlan(res.data);
      } catch (err) {
        toast.error("Không tìm thấy thông tin gói");
      } finally {
        setFetching(false);
      }
    }
    fetchPlan();
  }, [id]);

  const runAction = async (actionFn, successMsg) => {
    setLoading(true);
    try {
      await actionFn(id);
      toast.success(successMsg);
      router.push("/admin-subscribe-plan");
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="flex justify-center p-20 animate-spin">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 p-6 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chấm dứt gói đăng ký
          </h1>
          <p className="text-gray-500">
            Gói:{" "}
            <span className="font-semibold text-gray-800">{plan?.name}</span>
          </p>
        </div>

        {/* Option 1: Safe Cancellation */}
        {plan?.status === "active" && (
          <Card className="border-2 border-amber-100 bg-white overflow-hidden hover:border-amber-200 transition-all">
            <div className="p-6 flex gap-5">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                <Ban className="text-amber-600" size={24} />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Huỷ vào cuối kỳ (Khuyên dùng)
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Khách hàng vẫn được giao hàng đến hết ngày{" "}
                    <strong>{plan.currentPeriodEnd?.slice(0, 10)}</strong>. Sau
                    đó gói sẽ tự chuyển sang trạng thái hết hạn.
                  </p>
                </div>
                <button
                  disabled={loading}
                  onClick={() =>
                    runAction(planApi.cancel, "Đã đặt lịch huỷ vào cuối kỳ")
                  }
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  Xác nhận lịch huỷ
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Option 2: Danger Zone */}
        <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 space-y-6">
          <div className="flex items-center gap-2 text-red-700 font-bold uppercase tracking-widest text-xs">
            <AlertTriangle size={14} /> Vùng nguy hiểm
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900">
                Ngắt kết nối ngay lập tức
              </h4>
              <p className="text-xs text-gray-500">
                Dừng mọi hoạt động ngay bây giờ. Không khuyến khích trừ khi có
                yêu cầu đặc biệt.
              </p>
            </div>
            <button
              disabled={loading}
              onClick={() =>
                runAction(
                  planApi.cancelImmediately,
                  "Gói đã được dừng ngay lập tức",
                )
              }
              className="text-xs font-bold text-red-600 hover:underline shrink-0"
            >
              Dừng ngay
            </button>
          </div>

          <div className="pt-4 border-t border-red-200 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900">
                Xoá vĩnh viễn dữ liệu
              </h4>
              <p className="text-xs text-gray-500">
                Mọi lịch sử, thống kê và địa chỉ sẽ bị xoá khỏi hệ thống. Không
                thể hoàn tác.
              </p>
            </div>
            <button
              disabled={loading}
              onClick={() => {
                if (
                  window.confirm(
                    "Hành động này không thể hoàn tác. Bạn chắc chắn muốn xoá vĩnh viễn?",
                  )
                )
                  runAction(planApi.delete, "Đã xoá hoàn toàn dữ liệu");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm"
            >
              Xoá bản ghi
            </button>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={16} /> Quay lại quản lý
        </button>
      </div>
    </div>
  );
}
