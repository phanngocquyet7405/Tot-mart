"use client";
/**
 * PaymentStep.js
 * Bước 3 — Chọn phương thức thanh toán + mã giảm giá + QR thanh toán SePay.
 * Chuẩn hóa màu sắc token, bảo đảm trợ năng (vùng chạm >= 44px, label rõ ràng).
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Gift,
  ShieldCheck,
  Loader2,
  Check,
  QrCode,
  RefreshCw,
  AlertTriangle,
  Banknote,
  Smartphone,
  Copy,
  Clock,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { SectionCard } from "./SectionCard";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "./checkoutStyles";
import { PAYMENT_METHODS } from "@/app/services/api/Checkoutpageservice";
import { formatCurrency } from "@/app/util/formatter";
import logger from "@/app/util/Logger";

const METHOD_ICONS = { cod: Banknote, online: QrCode, momo: Smartphone };

// ─── Payment method radio ─────────────────────────────────────────────────────
function PaymentMethodCard({ method, selected, onSelect, disabled }) {
  const Icon = METHOD_ICONS[method.id] ?? CreditCard;
  const isMethodDisabled = disabled || method.available === false;
  const radioId = `pay-method-${method.id}`;

  return (
    <label
      htmlFor={radioId}
      className={[
        "flex items-center gap-4 p-4 rounded-xl border transition-colors duration-200 pointer-coarse:min-h-11",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        isMethodDisabled
          ? "border-border bg-muted/40 opacity-60 cursor-not-allowed"
          : selected
            ? "border-primary bg-primary/10 shadow-xs cursor-pointer"
            : "border-border bg-card hover:border-primary/40 cursor-pointer",
      ].join(" ")}
    >
      <input
        type="radio"
        id={radioId}
        name="payment"
        value={method.id}
        checked={selected}
        disabled={isMethodDisabled}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={[
          "grid place-items-center w-11 h-11 rounded-full shrink-0",
          selected && !isMethodDisabled ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
        ].join(" ")}
      >
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{method.label}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">{method.desc}</span>
      </span>
      {isMethodDisabled ? (
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-1 shrink-0">
          Sắp ra mắt
        </span>
      ) : (
        <span
          className={[
            "grid place-items-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors duration-200",
            selected ? "border-primary bg-primary" : "border-muted-foreground/40 bg-card",
          ].join(" ")}
          aria-hidden="true"
        >
          {selected && <Check size={11} strokeWidth={3} className="text-primary-foreground" />}
        </span>
      )}
    </label>
  );
}

// ─── Coupon input ─────────────────────────────────────────────────────────────
function CouponInput({ coupon, setCoupon, couponApplied, discount, onApply, disabled }) {
  return (
    <>
      <div className="flex gap-2">
        <label htmlFor="checkout-coupon-code" className="sr-only">
          Mã giảm giá
        </label>
        <input
          id="checkout-coupon-code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
          placeholder="Nhập mã giảm giá"
          aria-label="Mã giảm giá"
          disabled={couponApplied || disabled}
          className={`${INPUT} flex-1 uppercase`}
        />
        <button
          type="button"
          onClick={onApply}
          disabled={!coupon.trim() || couponApplied || disabled}
          className={[
            "rounded-xl px-5 text-xs font-bold uppercase tracking-[0.14em] min-h-11 transition-colors duration-200 shrink-0",
            couponApplied
              ? "bg-success text-success-foreground cursor-default"
              : "bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground",
          ].join(" ")}
        >
          {couponApplied ? (
            <span className="flex items-center gap-1">
              <Check size={13} /> Đã áp dụng
            </span>
          ) : (
            "Áp dụng"
          )}
        </button>
      </div>
      {couponApplied && (
        <p className="text-sm text-success-text font-semibold mt-2.5 flex items-center gap-1.5 tabular-nums">
          <Check size={14} /> Giảm {formatCurrency(discount)}
        </p>
      )}
    </>
  );
}

function parseQr(qrUrl) {
  try {
    const params = new URL(qrUrl).searchParams;
    return {
      acc: params.get("acc"),
      bank: params.get("bank"),
      amount: Number(params.get("amount")) || 0,
      des: params.get("des"),
    };
  } catch {
    return {};
  }
}

const isBlank = (v) => !v || v === "undefined" || v === "null";

function CopyRow({ label, value, display, strong }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
    } catch (err) {
      logger.error("[PaymentStep] copy failed:", err);
    }
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={[
            "mt-0.5 break-all text-foreground tabular-nums",
            strong ? "font-mono text-base font-bold" : "text-sm font-semibold",
          ].join(" ")}
        >
          {display ?? value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Sao chép ${label.toLowerCase()}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors pointer-coarse:min-h-11 shrink-0"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Đã chép" : "Sao chép"}
      </button>
    </div>
  );
}

// ─── Bộ đếm ngược thời gian hết hạn ──────────────────────────────────────────
function CountdownTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isUrgent = timeLeft < 120; // Dưới 2 phút

  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
        isUrgent
          ? "bg-destructive/10 border-destructive/30 text-destructive"
          : "bg-primary/10 border-primary/20 text-foreground"
      }`}
    >
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Clock size={15} className={isUrgent ? "text-destructive" : "text-primary"} />
        Thời gian giữ đơn và mã QR:
      </span>
      <span className="font-mono text-sm font-bold tabular-nums">
        {formatted}
      </span>
    </div>
  );
}

// ─── Panel QR SePay ───────────────────────────────────────────────────────────
function SepayQrPanel({
  qrUrl,
  onlineAmount,
  paymentCode,
  paymentStatus,
  expiresAt,
  isExpired,
  submitting,
  onRecheck,
  onChangeMethod,
  onRecreate,
}) {
  const parsed = useMemo(() => parseQr(qrUrl), [qrUrl]);
  const [failedUrl, setFailedUrl] = useState(null);

  const isTimeout = paymentStatus === "timeout";
  const isUnderpaid = paymentStatus === "underpaid";
  const isCancelled = paymentStatus === "cancelled";
  const expiredState = isExpired || paymentStatus === "expired";

  const configBroken = !qrUrl || isBlank(parsed.acc) || isBlank(parsed.bank);
  const imageFailed = failedUrl === qrUrl;
  const showImage = !configBroken && !imageFailed;

  const amount = onlineAmount || parsed.amount || 0;
  const content = paymentCode || parsed.des;

  if (expiredState) {
    return (
      <SectionCard title="Mã thanh toán đã hết hạn" icon={<AlertTriangle size={16} />}>
        <div role="alert" className="p-5 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive space-y-3">
          <h3 className="font-bold text-base">Phiên thanh toán đã hết thời gian hiệu lực</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Mã QR này chỉ có hiệu lực trong 15 phút để đảm bảo giữ tồn kho chính xác. Vui lòng tạo lại mã mới hoặc đổi phương thức thanh toán.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="button"
              onClick={onRecreate}
              disabled={submitting}
              className={`${BTN_PRIMARY} flex-1`}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Đang tạo lại...
                </>
              ) : (
                <>
                  <RotateCcw size={15} />
                  Tạo lại mã QR
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onChangeMethod}
              disabled={submitting}
              className={`${BTN_SECONDARY} flex-1`}
            >
              <ArrowLeft size={15} />
              Đổi phương thức thanh toán
            </button>
          </div>
        </div>
      </SectionCard>
    );
  }

  if (isCancelled) {
    return (
      <SectionCard title="Phiên thanh toán đã huỷ" icon={<AlertTriangle size={16} />}>
        <div role="alert" className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <p className="text-sm text-muted-foreground">
            Bạn đã huỷ phiên thanh toán trực tuyến này. Bạn có thể chọn phương thức khác hoặc tạo lại mã mới.
          </p>
          <button
            type="button"
            onClick={onChangeMethod}
            disabled={submitting}
            className={`${BTN_PRIMARY} w-full`}
          >
            Chọn phương thức thanh toán khác
          </button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Quét mã QR để thanh toán" icon={<QrCode size={16} />}>
      {/* Đồng hồ đếm ngược */}
      {expiresAt && (
        <div className="mb-4">
          <CountdownTimer expiresAt={expiresAt} onExpire={onRecreate} />
        </div>
      )}

      {isUnderpaid && (
        <div role="status" className="mb-4 p-4 rounded-xl border border-warning/30 bg-warning/10 text-warning-text">
          <p className="text-sm font-semibold">
            Hệ thống đã nhận một phần tiền. Vui lòng chuyển tiếp số tiền còn lại ({formatCurrency(amount)}) để hoàn tất đơn hàng.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[232px_1fr]">
        {/* QR Code */}
        <div className="mx-auto md:mx-0 w-full max-w-[232px]">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
            <div className="relative aspect-square w-full grid place-items-center bg-card">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt="Mã QR thanh toán ngân hàng SePay"
                  className="w-full h-full object-contain"
                  onError={() => setFailedUrl(qrUrl)}
                />
              ) : (
                <div className="px-3 text-center">
                  <AlertTriangle size={22} className="mx-auto text-warning-text" aria-hidden="true" />
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {configBroken
                      ? "Chưa tạo được ảnh QR. Hãy chuyển khoản theo thông tin bên cạnh."
                      : "Không tải được ảnh QR. Bạn hãy chuyển khoản theo thông tin bên cạnh."}
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Mở ứng dụng ngân hàng và quét mã
          </p>
        </div>

        {/* Thông tin chuyển khoản */}
        <div className="min-w-0">
          <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
            <p className="text-xs text-muted-foreground">Số tiền cần chuyển</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-primary tabular-nums">
              {formatCurrency(amount)}
            </p>
          </div>

          <div className="mt-2 divide-y divide-dashed divide-border">
            {!isBlank(parsed.bank) && <CopyRow label="Ngân hàng" value={parsed.bank} />}
            {!isBlank(parsed.acc) && <CopyRow label="Số tài khoản" value={parsed.acc} />}
            {amount > 0 && <CopyRow label="Số tiền" value={amount} display={formatCurrency(amount)} />}
            {content && <CopyRow label="Nội dung chuyển khoản" value={content} strong />}
          </div>

          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Vui lòng nhập chính xác nội dung chuyển khoản để hệ thống xác nhận tự động tức thì.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isTimeout ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 bg-warning/10 border border-warning/30 rounded-xl px-4 py-3"
          >
            <AlertTriangle size={16} className="text-warning-text shrink-0 mt-0.5" />
            <p className="text-sm text-warning-text leading-relaxed">
              Hệ thống chưa nhận được thanh toán. Nếu bạn đã chuyển khoản, hãy bấm &quot;Tôi đã chuyển khoản&quot; để kiểm tra lại ngay.
            </p>
          </div>
        ) : (
          <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={15} className="animate-spin shrink-0 text-primary" />
            Đang tự động kiểm tra thanh toán mỗi vài giây...
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onRecheck}
            disabled={submitting}
            className={`${BTN_PRIMARY} flex-1`}
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Tôi đã chuyển khoản, kiểm tra lại
          </button>

          <button
            type="button"
            onClick={onChangeMethod}
            disabled={submitting}
            className={`${BTN_SECONDARY} flex-1`}
          >
            <ArrowLeft size={14} />
            Đổi phương thức thanh toán
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

export function PaymentStep({
  paymentMethod,
  setPaymentMethod,
  coupon,
  setCoupon,
  couponApplied,
  discount,
  finalTotal,
  submitting,
  paymentStatus,
  paymentCode,
  qrUrl,
  onlineAmount,
  expiresAt,
  isExpired,
  onApplyCoupon,
  onBack,
  onPlaceOrder,
  onCancelSession,
  onRecreateSession,
  onRecheckPayment,
}) {
  const isAwaitingPayment =
    paymentMethod === "online" &&
    (paymentStatus === "awaiting_payment" ||
      paymentStatus === "underpaid" ||
      paymentStatus === "timeout" ||
      paymentStatus === "expired" ||
      paymentStatus === "cancelled" ||
      isExpired);

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      {isAwaitingPayment ? (
        <SepayQrPanel
          qrUrl={qrUrl}
          onlineAmount={onlineAmount}
          paymentCode={paymentCode}
          paymentStatus={paymentStatus}
          expiresAt={expiresAt}
          isExpired={isExpired}
          submitting={submitting}
          onRecheck={onRecheckPayment}
          onChangeMethod={onCancelSession}
          onRecreate={onRecreateSession}
        />
      ) : (
        <>
          <SectionCard title="Phương thức thanh toán" icon={<CreditCard size={16} />}>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((pm) => (
                <PaymentMethodCard
                  key={pm.id}
                  method={pm}
                  selected={paymentMethod === pm.id}
                  onSelect={() => setPaymentMethod(pm.id)}
                  disabled={submitting}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Mã giảm giá" icon={<Gift size={16} />}>
            <CouponInput
              coupon={coupon}
              setCoupon={setCoupon}
              couponApplied={couponApplied}
              discount={discount}
              onApply={onApplyCoupon}
              disabled={submitting}
            />
          </SectionCard>

          <p className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <ShieldCheck size={14} className="text-success-text shrink-0" />
            Thông tin thanh toán được bảo mật và mã hoá theo tiêu chuẩn an toàn.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              className={`${BTN_SECONDARY} flex-1`}
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={onPlaceOrder}
              disabled={submitting}
              className={`${BTN_PRIMARY} flex-[2]`}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : paymentMethod === "online" ? (
                <>
                  Tạo mã thanh toán QR ·{" "}
                  <span className="tabular-nums">{formatCurrency(finalTotal)}</span>
                </>
              ) : (
                <>
                  Đặt hàng COD ·{" "}
                  <span className="tabular-nums">{formatCurrency(finalTotal)}</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
