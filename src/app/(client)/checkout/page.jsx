"use client";
/**
 * page.jsx — Trang Checkout
 * Route: /checkout
 *
 * Pure orchestrator: không chứa logic, chỉ compose hook + components.
 * Chuẩn hóa màu sắc token: warm cream (bg-background), terracotta (bg-primary), border-border, text-foreground.
 */

import { Suspense } from "react";
import { needsReconciliation } from "@/app/util/purchaseAttempt.mjs";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useCheckout } from "@/app/hook/checkout/useCheckout";
import { CheckoutStepper } from "../components/Checkout_component/CheckoutStepper";
import { AddressStep } from "../components/Checkout_component/AddressStep";
import { ReviewStep } from "../components/Checkout_component/ReviewStep";
import { PaymentStep } from "../components/Checkout_component/PaymentStep";
import { OrderSummary } from "../components/Checkout_component/OrderSummary";
import { OrderSuccessScreen } from "../components/Checkout_component/OrderSuccessScreen";

// ─── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4" role="status">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm text-muted-foreground font-medium">Đang tải tiến trình thanh toán...</p>
      </div>
    </div>
  );
}

// ─── Page Inner ────────────────────────────────────────────────────────────────
function CheckoutPageInner() {
  const router = useRouter();
  const checkout = useCheckout();

  // Success screen
  if (checkout.orderSuccess) return <OrderSuccessScreen onNew={checkout.handleStartNew} submitting={checkout.submitting} />;

  // Loading screen
  if (!checkout.isMounted || checkout.loading || checkout.resuming)
    return <LoadingScreen />;

  return (
    <div className="tm-commerce tm-commerce--atelier min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Quay lại"
            className="grid place-items-center w-11 h-11 rounded-full border border-border bg-card text-foreground hover:border-primary/60 hover:text-primary transition-colors duration-200 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
              Thanh toán
            </h1>
            {checkout.hasProducts && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 tabular-nums">
                {checkout.cartItems.length} loại · {checkout.cartCount} sản phẩm
              </p>
            )}
          </div>
        </div>

        {checkout.pendingAttempt?.state === 'created' && (
          <div className="tm-notice mb-6 p-5 rounded-2xl border border-primary/30 bg-primary/10">
            <p className="font-bold text-foreground mb-2">Giao dịch đã tồn tại: <span className="tabular-nums">{checkout.pendingAttempt.result?.orderCode}</span></p>
            <div className="flex flex-wrap gap-3 mt-3">
              <button className="tm-button tm-button--primary px-4 py-2 min-h-11 text-xs font-bold rounded-xl" disabled={checkout.submitting} onClick={checkout.handleStartNew}>
                Đặt đơn mới
              </button>
              <Link className="tm-text-button flex items-center text-xs font-bold text-primary hover:underline px-3 py-2 min-h-11" href={`/checkout?code=${encodeURIComponent(checkout.pendingAttempt.result?.orderCode || '')}`}>
                Xem / thanh toán đơn cũ
              </Link>
            </div>
          </div>
        )}

        {checkout.pendingAttempt && !checkout.paymentCode && (
          <section role="status" className="tm-notice mb-8 p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              {checkout.pendingAttempt.state === 'created'
                ? 'Đơn hàng đã được tạo'
                : checkout.pendingAttempt.state === 'confirming'
                  ? 'Đang xác nhận kết quả giao dịch'
                  : 'Kiểm tra yêu cầu đặt hàng trước'}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {checkout.pendingAttempt.state === 'created'
                ? 'Bạn có thể xem đơn cũ hoặc chủ động đặt đơn mới.'
                : checkout.pendingAttempt.state === 'confirming'
                  ? 'Hệ thống đang xác nhận kết quả giao dịch từ phía máy chủ. Giữ nguyên reference hoặc bấm kiểm tra lại.'
                  : 'Giữ nguyên reference cho đến khi BE xác nhận kết quả hoặc kết thúc lần thử.'}
            </p>
            <ul className="space-y-2 border-y border-border py-3">
              {checkout.pendingAttempt.summary?.items?.map((item, i) => (
                <li key={i} className="flex justify-between gap-4 text-sm">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">× {item.quantity}</span>
                </li>
              ))}
            </ul>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-muted/40 p-3 rounded-xl">
                <dt className="text-muted-foreground mb-1">Tổng yêu cầu cũ</dt>
                <dd className="font-bold text-foreground text-sm tabular-nums">
                  {Number.isFinite(checkout.pendingAttempt.summary?.totalAmount)
                    ? checkout.pendingAttempt.summary.totalAmount.toLocaleString('vi-VN') + ' ₫'
                    : 'Chưa lưu — cần đối chiếu'}
                </dd>
              </div>
              <div className="bg-muted/40 p-3 rounded-xl">
                <dt className="text-muted-foreground mb-1">Thời điểm gửi</dt>
                <dd className="font-medium text-foreground">
                  {checkout.pendingAttempt.sentAt
                    ? new Date(checkout.pendingAttempt.sentAt).toLocaleString('vi-VN')
                    : 'Chưa lưu'}
                </dd>
              </div>
              <div className="sm:col-span-2 bg-muted/40 p-3 rounded-xl">
                <dt className="text-muted-foreground mb-1">Địa chỉ cũ đã che</dt>
                <dd className="font-medium text-foreground">
                  {checkout.pendingAttempt.summary?.address || 'Chưa lưu — cần đối chiếu'}
                </dd>
              </div>
            </dl>
            {checkout.pendingDraftChanged && (
              <p role="alert" className="text-xs font-semibold text-warning-text bg-warning/10 p-3 rounded-xl border border-warning/20">
                Giỏ hàng hoặc địa chỉ hiện tại đã khác. Tiếp tục chỉ xử lý yêu cầu cũ; thay đổi hiện tại không được gửi.
              </p>
            )}
            {checkout.pendingAttempt?.blocked && (
              <p role="alert" className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                Không thể đọc thông tin giao dịch từ bộ nhớ trình duyệt. Vui lòng kiểm tra mục <Link href="/profile/orders" className="underline font-bold">Đơn hàng của tôi</Link> hoặc liên hệ hỗ trợ TotMart để đối chiếu.
              </p>
            )}
            {(needsReconciliation(checkout.pendingAttempt)) && (
              <p role="alert" className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 font-semibold">
                Cần TotMart xác minh yêu cầu trước. Chưa thể gửi lại hay bắt đầu lần thử mới. Lịch sử đơn hàng không chứng minh yêu cầu chưa được tạo.
              </p>
            )}
            {checkout.pendingAttempt.snapshot && (
              <p className="text-xs text-muted-foreground">
                Địa chỉ BE xác nhận: {[checkout.pendingAttempt.snapshot.fullName, checkout.pendingAttempt.snapshot.address, checkout.pendingAttempt.snapshot.district, checkout.pendingAttempt.snapshot.city, checkout.pendingAttempt.snapshot.phone].filter(Boolean).join(', ')}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Trạng thái: <span className="font-semibold text-foreground">{checkout.pendingAttempt.state === 'confirming' ? 'đang xác nhận' : checkout.pendingAttempt.state || 'chưa xác định'}</span>
            </p>
            {checkout.pendingAttempt.error?.message && (
              <p role="alert" className="text-xs text-destructive">{checkout.pendingAttempt.error.message}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              {checkout.pendingAttempt.hash && checkout.pendingAttempt.state !== 'created' && checkout.pendingAttempt.state !== 'rejected' && checkout.pendingAttempt.state !== 'confirming' && (
                <button className="tm-button tm-button--primary px-4 py-2.5 min-h-11 rounded-xl text-xs font-bold" disabled={checkout.submitting} onClick={event => checkout.handlePlaceOrder(event, { confirm: true })}>
                  Xác nhận đúng địa chỉ và tổng tiền trên
                </button>
              )}
              {checkout.pendingAttempt.state !== 'created' && (!checkout.pendingAttempt.state || checkout.pendingAttempt.state !== 'confirming' || checkout.pendingAttempt.terminationRequested) && (
                <button className="tm-button tm-button--outline px-4 py-2.5 min-h-11 rounded-xl text-xs font-bold border border-border" disabled={checkout.submitting} onClick={event => checkout.handlePlaceOrder(event, { terminate: true })}>
                  Kết thúc lần thử
                </button>
              )}
            </div>
            <p className="tm-notice__reference text-xs font-mono text-muted-foreground">
              Mã đối chiếu: <span className="font-bold text-foreground">{checkout.pendingAttempt.key}</span>
            </p>
            <p className="text-xs text-muted-foreground">Khi liên hệ TotMart, cung cấp mã này để kiểm tra đúng yêu cầu.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                className="tm-button tm-button--outline px-4 py-2.5 min-h-11 rounded-xl text-xs font-bold border border-border"
                disabled={checkout.submitting || needsReconciliation(checkout.pendingAttempt)}
                onClick={checkout.handlePlaceOrder}
              >
                {checkout.submitting ? 'Đang kiểm tra…' : checkout.pendingAttempt.state === 'confirming' ? 'Kiểm tra lại kết quả' : 'Tiếp tục đúng yêu cầu cũ'}
              </button>
              <Link href="/pages/contact-us" className="tm-text-button flex items-center text-xs font-semibold text-primary hover:underline px-3 py-2 min-h-11">
                Liên hệ TotMart
              </Link>
            </div>
          </section>
        )}

        {/* ── Stepper ── */}
        <CheckoutStepper
          currentStep={checkout.step}
          onGoBack={(id) => checkout.setStep(id)}
        />

        {/* ── Layout 2 cột ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
          {/* Cột trái — Steps */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {/* BƯỚC 1: ĐỊA CHỈ */}
              {checkout.step === "address" && (
                <AddressStep
                  user={checkout.user}
                  addresses={checkout.addresses}
                  displayedAddresses={checkout.displayedAddresses}
                  selectedAddress={checkout.selectedAddress}
                  showAllAddresses={checkout.showAllAddresses}
                  setShowAllAddresses={checkout.setShowAllAddresses}
                  addingNew={checkout.addingNew}
                  newAddress={checkout.newAddress}
                  note={checkout.note}
                  setNote={checkout.setNote}
                  onSelectAddress={checkout.handleSelectAddress}
                  onToggleAddNew={checkout.handleToggleAddNew}
                  onAddressFieldChange={checkout.handleNewAddressChange}
                  onNext={checkout.handleAddressNext}
                  savingAddress={checkout.savingAddress}
                />
              )}

              {/* BƯỚC 2: KIỂM TRA */}
              {checkout.step === "review" && (
                <ReviewStep
                  cartItems={checkout.cartItems}
                  cartCount={checkout.cartCount}
                  hasProducts={checkout.hasProducts}
                  selectedAddress={checkout.selectedAddress}
                  newAddress={checkout.newAddress}
                  user={checkout.user}
                  onBack={() => checkout.setStep("address")}
                  onNext={() => checkout.setStep("payment")}
                />
              )}

              {/* BƯỚC 3: THANH TOÁN */}
              {checkout.step === "payment" && (
                <PaymentStep
                  paymentMethod={checkout.paymentMethod}
                  setPaymentMethod={checkout.setPaymentMethod}
                  coupon={checkout.coupon}
                  setCoupon={checkout.setCoupon}
                  couponApplied={checkout.couponApplied}
                  giftFee={checkout.giftFee}
                  bulkDiscountAmount={checkout.bulkDiscountAmount}
                  discount={checkout.discount}
                  finalTotal={checkout.finalTotal}
                  submitting={checkout.submitting}
                  paymentStatus={checkout.paymentStatus}
                  paymentCode={checkout.paymentCode}
                  qrUrl={checkout.qrUrl}
                  onlineAmount={checkout.onlineAmount}
                  onApplyCoupon={checkout.handleApplyCoupon}
                  onBack={() => checkout.setStep("review")}
                  onPlaceOrder={checkout.handlePlaceOrder}
                  onRecheckPayment={checkout.handleRecheckPayment}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Cột phải — Summary */}
          <OrderSummary
            cartItems={checkout.cartItems}
            hasProducts={checkout.hasProducts}
            cartTotal={checkout.cartTotal}
            shippingFee={checkout.shippingFee}
            giftFee={checkout.giftFee}
            bulkDiscountAmount={checkout.bulkDiscountAmount}
            discount={checkout.discount}
            finalTotal={checkout.finalTotal}
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CheckoutPageInner />
    </Suspense>
  );
}
