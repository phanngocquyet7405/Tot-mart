"use client";
/**
 * payment-result/page.js
 * Route: /checkout/payment-result
 *
 * VNPay redirect user về đây sau khi thanh toán.
 * 3 trạng thái rõ ràng: Đang kiểm tra (checking) / Thành công (success) / Thất bại (failed).
 * Không hiển thị mã lỗi nội bộ gây rối; cung cấp các hành động kế tiếp rõ ràng.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, XCircle, ArrowRight, ShoppingBag, RefreshCw } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { paymentGatewayService } from "@/app/services/api/paymentGatewayService";
import { OrderSuccessScreen } from "../../components/Checkout_component/OrderSuccessScreen";
import logger from "@/app/util/Logger";

// ─── 1. Checking Screen (Đang xác nhận) ──────────────────────────────────────
function CheckingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm py-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            Đang xác nhận kết quả thanh toán
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hệ thống đang đối chiếu trạng thái giao dịch từ cổng thanh toán. Vui lòng không đóng hoặc tải lại trang trong giây lát.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Failed Screen (Thanh toán chưa thành công) ───────────────────────────
function FailedScreen({ onRetry }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-5 text-center max-w-md py-12">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 border-2 border-destructive/25 flex items-center justify-center">
          <XCircle size={40} className="text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Thanh toán chưa hoàn tất
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed px-4">
            Giao dịch bị huỷ hoặc chưa ghi nhận thành công từ phía ngân hàng. Đơn hàng của bạn vẫn được lưu giữ an toàn, bạn có thể thử thanh toán lại hoặc chọn phương thức khác.
          </p>
        </div>
        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors active:scale-[0.98] shadow-xs flex items-center justify-center gap-2"
          >
            <RefreshCw size={15} />
            Thử thanh toán lại
          </button>
          <button
            type="button"
            onClick={() => router.push("/profile/orders")}
            className="w-full border border-border bg-card text-foreground py-3 min-h-11 rounded-xl font-bold hover:bg-muted transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <ShoppingBag size={15} />
            Xem đơn hàng của tôi
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full border border-border bg-card/60 text-muted-foreground hover:text-foreground py-3 min-h-11 rounded-xl font-semibold uppercase tracking-wider text-xs hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
          >
            Về trang chủ
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Main Orchestrator ─────────────────────────────────────────────────────
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
  if (status === "success") return <OrderSuccessScreen onNew={() => router.push("/products")} />;
  return <FailedScreen onRetry={() => router.push("/checkout")} />;
}
