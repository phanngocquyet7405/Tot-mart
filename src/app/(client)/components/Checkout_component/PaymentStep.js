"use client";
/**
 * PaymentStep.js
 * Bước 3 — Chọn phương thức thanh toán + mã giảm giá + đặt hàng.
 * Chuẩn hóa màu sắc token, bảo đảm trợ năng (nhãn, vùng chạm >= 44px).
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
  ExternalLink,
} from "lucide-react";
import { SectionCard } from "./SectionCard";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "./checkoutStyles";
import { PAYMENT_METHODS } from "@/app/services/api/Checkoutpageservice";
import { formatCurrency } from "@/app/util/formatter";
import logger from "@/app/util/Logger";

const METHOD_ICONS = { cod: Banknote, online: QrCode, momo: Smartphone };

// ─── Payment method radio ─────────────────────────────────────────────────────
function PaymentMethodCard({ method, selected, onSelect }) {
  const Icon = METHOD_ICONS[method.id] ?? CreditCard;
  const disabled = method.available === false;
  const radioId = `pay-method-${method.id}`;

  return (
    <label
      htmlFor={radioId}
      className={[
        "flex items-center gap-4 p-4 rounded-xl border transition-colors duration-200 pointer-coarse:min-h-11",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        disabled
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
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={[
          "grid place-items-center w-11 h-11 rounded-full shrink-0",
          selected && !disabled ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
        ].join(" ")}
      >
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{method.label}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">{method.desc}</span>
      </span>
      {disabled ? (
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
function CouponInput({ coupon, setCoupon, couponApplied, discount, onApply }) {
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
          disabled={couponApplied}
          className={`${INPUT} flex-1 uppercase`}
        />
        <button
          type="button"
          onClick={onApply}
          disabled={!coupon.trim() || couponApplied}
          className={[
            "rounded-xl px-5 text-xs font-bold uppercase tracking-[0.14em] min-h-11 transition-colors duration-200 shrink-0",
            couponApplied
              ? "bg-success-text text-white cursor-default"
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
        {copied ? "Đã chép" : "Chép"}
      </button>
    </div>
  );
}

function SepayQrPanel({ qrUrl, onlineAmount, paymentCode, paymentStatus, onRecheck }) {
  const parsed = useMemo(() => parseQr(qrUrl), [qrUrl]);
  const [failedUrl, setFailedUrl] = useState(null);

  const isTimeout = paymentStatus === "timeout";
  const isUnderpaid = paymentStatus === "underpaid";
  const isNonPayable = paymentStatus === "cancelled" || paymentStatus === "expired" || paymentStatus === "on_hold";

  if (isNonPayable) {
    return (
      <SectionCard title="Trạng thái đơn hàng" icon={<AlertTriangle size={16} />}>
        <div role="alert" className="p-5 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive space-y-3">
          <h3 className="font-bold text-base">
            {paymentStatus === "on_hold"
              ? "Đơn hàng đang tạm giữ"
              : "Mã thanh toán không còn hiệu lực"}
          </h3>
          <p className="text-sm leading-relaxed">
            {paymentStatus === "on_hold"
              ? "Đơn hàng đang được tạm giữ để kiểm tra tồn kho. TotMart đã ghi nhận thanh toán và đang xử lý điều phối tồn kho."
              : "Đơn hàng không còn hiệu lực nhận thanh toán. Nếu bạn đã chuyển khoản, khoản tiền sẽ vào quy trình đối soát hoàn tiền hoặc liên hệ hỗ trợ TotMart kèm mã thanh toán để được hỗ trợ."}
          </p>
          {paymentCode && (
            <div className="pt-2 border-t border-destructive/20 text-xs font-mono">
              Mã thanh toán: <span className="font-bold tabular-nums">{paymentCode}</span>
            </div>
          )}
        </div>
      </SectionCard>
    );
  }

  const configBroken = !qrUrl || isBlank(parsed.acc) || isBlank(parsed.bank);
  const imageFailed = failedUrl === qrUrl;
  const showImage = !configBroken && !imageFailed;

  const amount = onlineAmount || parsed.amount || 0;
  const content = paymentCode || parsed.des;

  return (
    <SectionCard title="Quét mã để thanh toán" icon={<QrCode size={16} />}>
      {isUnderpaid && (
        <div role="status" className="mb-6 p-4 rounded-xl border border-warning/30 bg-warning/10 text-warning-text">
          <p className="text-sm font-semibold">
            Hệ thống đã nhận một phần tiền thanh toán. Vui lòng quét mã bên dưới hoặc chuyển tiếp số tiền còn lại ({formatCurrency(amount)}) để hoàn tất đơn hàng.
          </p>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[232px_1fr]">
        {/* QR */}
        <div className="mx-auto md:mx-0 w-full max-w-[232px]">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
            <div className="relative aspect-square w-full grid place-items-center bg-card">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt="Mã QR chuyển khoản SePay"
                  className="w-full h-full object-contain"
                  onError={() => setFailedUrl(qrUrl)}
                />
              ) : (
                <div className="px-3 text-center">
                  <AlertTriangle size={22} className="mx-auto text-warning-text" aria-hidden="true" />
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {configBroken
                      ? "Chưa tạo được mã QR. Hãy liên hệ hỗ trợ kèm mã đơn bên cạnh."
                      : "Không tải được ảnh QR. Bạn có thể mở mã ở tab mới hoặc chuyển khoản theo thông tin bên cạnh."}
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-2.5 text-center text-xs text-muted-foreground">
            Mở app ngân hàng và quét mã
          </p>
          {imageFailed && !configBroken && (
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary underline underline-offset-4 pointer-coarse:min-h-11"
            >
              <ExternalLink size={12} /> Mở mã QR
            </a>
          )}
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
            Nhập đúng nội dung chuyển khoản để đơn được xác nhận tự động.
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
              Chưa nhận được thanh toán sau 10 phút. Nếu đã chuyển khoản, bấm kiểm tra lại;
              nếu tiền đã bị trừ, hãy liên hệ hỗ trợ kèm mã đơn.
            </p>
          </div>
        ) : (
          <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={15} className="animate-spin shrink-0 text-primary" />
            Đang chờ thanh toán, hệ thống tự kiểm tra mỗi vài giây.
          </p>
        )}

        <button type="button" onClick={onRecheck} className={`${BTN_SECONDARY} w-full`}>
          <RefreshCw size={14} />
          Tôi đã chuyển khoản, kiểm tra lại
        </button>
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
  onApplyCoupon,
  onBack,
  onPlaceOrder,
  onRecheckPayment,
}) {
  const isAwaitingPayment =
    paymentMethod === "online" &&
    (paymentStatus === "awaiting_payment" ||
     paymentStatus === "underpaid" ||
     paymentStatus === "timeout" ||
     paymentStatus === "cancelled" ||
     paymentStatus === "expired" ||
     paymentStatus === "on_hold");

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
          onRecheck={onRecheckPayment}
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
            />
          </SectionCard>

          <p className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <ShieldCheck size={14} className="text-success-text shrink-0" />
            Thông tin thanh toán được mã hóa và bảo mật.
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
                  Đang xử lý
                </>
              ) : (
                <>
                  Chuẩn bị xác nhận ·{" "}
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
