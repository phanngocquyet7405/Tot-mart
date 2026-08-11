/**
 * payment-result/page.jsx
 * Route: /checkout/payment-result
 *
 * VNPay redirect user về đây sau khi thanh toán xong (đây là "returnUrl"
 * khai báo lúc tạo payment URL ở BE).
 *
 * QUAN TRỌNG: trang này CHỈ đọc kết quả để hiển thị cho user ngay lúc đó.
 * Trạng thái đơn hàng thật sự đã được BE chốt qua IPN (VNPay gọi
 * server-to-server, độc lập với trình duyệt) — nên kể cả khi user tắt tab
 * ở bước này, đơn hàng vẫn được xử lý đúng.
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { paymentGatewayService } from "@/app/services/api/paymentGatewayService";
import { OrderSuccessScreen } from "../../components/Checkout_component/OrderSuccessScreen";
import logger from "@/app/util/Logger";

// ─── Loading ────────────────────────────────────────────────────────────────
function CheckingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-sm text-slate-600 font-medium">
          Đang xác nhận kết quả thanh toán...
        </p>
      </div>
    </div>
  );
}

// ─── Failed ───────────────────────────────────────────────────────────────────
function FailedScreen({ onRetry }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-600/20 flex items-center justify-center">
          <XCircle size={36} className="text-rose-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 mb-2">
            Thanh toán không thành công
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Giao dịch bị huỷ hoặc thất bại. Đơn hàng của bạn vẫn được giữ lại,
            bạn có thể thử thanh toán lại.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-600/20"
        >
          Quay lại thanh toán
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [status, setStatus] = useState("checking"); // checking | success | failed

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await paymentGatewayService.verifyVnpayReturn(searchParams);
        const isSuccess = res.data?.data?.success ?? res.data?.success;

        if (cancelled) return;

        if (isSuccess) {
          clearCart();
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (err) {
        if (cancelled) return;
        logger.error("[PaymentResultPage] verifyVnpayReturn:", err);
        setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "checking") return <CheckingScreen />;
  if (status === "success") return <OrderSuccessScreen />;
  return <FailedScreen onRetry={() => router.push("/checkout")} />;
}
