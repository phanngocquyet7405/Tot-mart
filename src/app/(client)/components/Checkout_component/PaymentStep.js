/**
 * PaymentStep.js
 * Bước 3 — Chọn phương thức thanh toán + mã giảm giá + đặt hàng.
 *
 * Khi paymentMethod = "online" (SePay) và đơn đã được tạo (paymentStatus
 * "awaiting_payment" | "timeout"), toàn bộ form được thay bằng SepayQrPanel —
 * đơn đã chốt ở BE nên không cho đổi phương thức hay quay lại ở bước này.
 */

"use client";

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

  return (
    <label
      className={[
        "flex items-center gap-4 p-4 rounded-xl border transition-colors duration-200",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#C85C3C]",
        disabled
          ? "border-[#F0DDD5] bg-stone-50 opacity-60 cursor-not-allowed"
          : selected
            ? "border-[#C85C3C] bg-[#FFF0EB] cursor-pointer"
            : "border-[#F0DDD5] bg-white hover:border-[#C85C3C]/50 cursor-pointer",
      ].join(" ")}
    >
      <input
        type="radio"
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
          selected && !disabled ? "bg-[#C85C3C] text-white" : "bg-[#FFF0EB] text-[#C85C3C]",
        ].join(" ")}
      >
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#2C1810]">{method.label}</span>
        <span className="block text-xs text-stone-500 mt-0.5">{method.desc}</span>
      </span>
      {disabled ? (
        <span className="text-[11px] font-semibold text-stone-500 bg-stone-200/70 rounded-full px-2.5 py-1 shrink-0">
          Sắp ra mắt
        </span>
      ) : (
        <span
          className={[
            "grid place-items-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors duration-200",
            selected ? "border-[#C85C3C] bg-[#C85C3C]" : "border-stone-300 bg-white",
          ].join(" ")}
          aria-hidden="true"
        >
          {selected && <Check size={11} strokeWidth={3} className="text-white" />}
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
        <input
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
            "rounded-xl px-5 text-xs font-extrabold uppercase tracking-[0.14em] transition-colors duration-200",
            couponApplied
              ? "bg-[#15803d] text-white cursor-default"
              : "bg-[#2C1810] text-white hover:bg-[#4a2c1f] disabled:bg-stone-200 disabled:text-stone-400",
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
        <p className="text-sm text-[#15803d] font-semibold mt-2.5 flex items-center gap-1.5">
          <Check size={14} /> Giảm {formatCurrency(discount)}
        </p>
      )}
    </>
  );
}

// ─── SePay QR panel ──────────────────────────────────────────────────────────
// BE dựng qrUrl dạng https://qr.sepay.vn/img?acc=…&bank=…&amount=…&des=… nên FE
// đọc lại các tham số đó để hiện thông tin chuyển khoản thủ công (sao chép được)
// — khách vẫn thanh toán được khi không quét được ảnh QR.
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
        <p className="text-xs text-stone-500">{label}</p>
        <p
          className={[
            "mt-0.5 break-all text-[#2C1810] tabular-nums",
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#F0DDD5] px-2.5 py-1.5 text-xs font-semibold text-[#B14B2D] hover:bg-[#FFF0EB] transition-colors duration-200 shrink-0"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Đã chép" : "Chép"}
      </button>
    </div>
  );
}

function SepayQrPanel({ qrUrl, onlineAmount, paymentCode, paymentStatus, onRecheck }) {
  const isTimeout = paymentStatus === "timeout";
  const parsed = useMemo(() => parseQr(qrUrl), [qrUrl]);
  const [failedUrl, setFailedUrl] = useState(null);

  // qrUrl thiếu/hỏng (vd. BE chưa cấu hình SEPAY_BANK_ACCOUNT / SEPAY_BANK_NAME
  // → acc=undefined&bank=undefined): không vẽ ảnh vỡ, báo rõ cho khách.
  const configBroken = !qrUrl || isBlank(parsed.acc) || isBlank(parsed.bank);
  const imageFailed = failedUrl === qrUrl;
  const showImage = !configBroken && !imageFailed;

  useEffect(() => {
    if (configBroken) {
      logger.error("[PaymentStep] qrUrl thiếu tài khoản/ngân hàng:", qrUrl);
    }
  }, [configBroken, qrUrl]);

  const amount = onlineAmount || parsed.amount || 0;
  const content = paymentCode || parsed.des;

  return (
    <SectionCard title="Quét mã để thanh toán" icon={<QrCode size={16} />}>
      <div className="grid gap-6 md:grid-cols-[232px_1fr]">
        {/* QR */}
        <div className="mx-auto md:mx-0 w-full max-w-[232px]">
          <div className="rounded-2xl border border-[#F0DDD5] bg-white p-3">
            <div className="relative aspect-square w-full grid place-items-center bg-white">
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
                  <AlertTriangle size={22} className="mx-auto text-amber-600" aria-hidden="true" />
                  <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                    {configBroken
                      ? "Chưa tạo được mã QR. Hãy liên hệ hỗ trợ kèm mã đơn bên cạnh."
                      : "Không tải được ảnh QR. Bạn có thể mở mã ở tab mới hoặc chuyển khoản theo thông tin bên cạnh."}
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-2.5 text-center text-xs text-stone-500">
            Mở app ngân hàng và quét mã
          </p>
          {imageFailed && !configBroken && (
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#C85C3C] underline underline-offset-4"
            >
              <ExternalLink size={12} /> Mở mã QR
            </a>
          )}
        </div>

        {/* Thông tin chuyển khoản */}
        <div className="min-w-0">
          <div className="rounded-xl bg-[#FFF5F2] border border-[#F0DDD5] px-4 py-3">
            <p className="text-xs text-stone-500">Số tiền cần chuyển</p>
            <p className="font-serif text-3xl font-semibold text-[#C85C3C] tabular-nums">
              {formatCurrency(amount)}
            </p>
          </div>

          <div className="mt-2 divide-y divide-dashed divide-[#F0DDD5]">
            {!isBlank(parsed.bank) && <CopyRow label="Ngân hàng" value={parsed.bank} />}
            {!isBlank(parsed.acc) && <CopyRow label="Số tài khoản" value={parsed.acc} />}
            {amount > 0 && <CopyRow label="Số tiền" value={amount} display={formatCurrency(amount)} />}
            {content && <CopyRow label="Nội dung chuyển khoản" value={content} strong />}
          </div>

          <p className="mt-2 text-xs text-stone-500 leading-relaxed">
            Nhập đúng nội dung chuyển khoản để đơn được xác nhận tự động.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isTimeout ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          >
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              Chưa nhận được thanh toán sau 10 phút. Nếu đã chuyển khoản, bấm kiểm tra lại;
              nếu tiền đã bị trừ, hãy liên hệ hỗ trợ kèm mã đơn.
            </p>
          </div>
        ) : (
          <p role="status" className="flex items-center gap-2 text-sm text-stone-600">
            <Loader2 size={15} className="animate-spin shrink-0 text-[#C85C3C]" />
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export function PaymentStep({
  paymentMethod,
  setPaymentMethod,
  coupon,
  setCoupon,
  couponApplied,
  discount,
  finalTotal,
  submitting,
  paymentStatus, // "idle" | "awaiting_payment" | "paid" | "timeout"
  paymentCode,
  qrUrl,
  onlineAmount,
  onApplyCoupon,
  onBack,
  onPlaceOrder,
  onRecheckPayment,
}) {
  // "paid" không cần xử lý ở đây — page.jsx unmount cả bước checkout và
  // chuyển thẳng sang OrderSuccessScreen khi orderSuccess = true.
  const isAwaitingPayment =
    paymentMethod === "online" &&
    (paymentStatus === "awaiting_payment" || paymentStatus === "timeout");

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

          <p className="flex items-center gap-2 text-xs text-stone-600 px-1">
            <ShieldCheck size={14} className="text-[#15803d] shrink-0" />
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
                  {paymentMethod === "online" ? "Tạo mã QR" : "Đặt hàng"} ·{" "}
                  {formatCurrency(finalTotal)}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
