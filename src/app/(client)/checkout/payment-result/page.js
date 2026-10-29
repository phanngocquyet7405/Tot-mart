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
import { Loader2, XCircle, ArrowRight, ShoppingBag, RefreshCw, Copy, Check } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { paymentGatewayService } from "@/app/services/api/paymentGatewayService";
import { OrderSuccessScreen } from "../../components/Checkout_component/OrderSuccessScreen";
import logger from "@/app/util/Logger";

// ─── 0. Copy Reference Badge ──────────────────────────────────────────────────
function ReferenceSnippet({ code }) {
  const [copied, setCopied] = useState(false);
  if (!code) return null;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <div className="w-full bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-2 text-left my-2">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
          Mã tham chiếu đơn hàng
        </div>
        <div className="text-sm font-mono font-medium text-foreground truncate select-all">
          {code}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-xs flex items-center gap-1.5 border border-border"
        aria-label="Sao chép mã tham chiếu"
        title="Sao chép mã tham chiếu"
      >
        {copied ? (
          <>
            <Check size={13} className="text-success-text" />
            <span className="text-[11px] font-medium text-success-text">Đã chép</span>
          </>
        ) : (
          <>
            <Copy size={13} />
            <span className="text-[11px] font-medium">Sao chép</span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── 1. Checking Screen (Đang xác nhận) ──────────────────────────────────────
function CheckingScreen({ refCode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm py-12 w-full">
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
        <ReferenceSnippet code={refCode} />
      </div>
    </div>
  );
}

// ─── 2. Failed Screen (Thanh toán chưa thành công) ───────────────────────────
function FailedScreen({ onRetry, refCode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-5 text-center max-w-md py-12 w-full">
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
        <ReferenceSnippet code={refCode} />
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

  const refCode =
    searchParams.get("vnp_TxnRef") ||
    searchParams.get("orderCode") ||
    searchParams.get("orderId") ||
    searchParams.get("code") ||
    "";

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

  if (status === "checking") return <CheckingScreen refCode={refCode} />;
  if (status === "success") return <OrderSuccessScreen onNew={() => router.push("/products")} />;
  return <FailedScreen onRetry={() => router.push("/checkout")} refCode={refCode} />;
}
