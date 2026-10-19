/**
 * page.js — Trang Checkout
 * Route: /checkout
 *
 * Pure orchestrator: không chứa logic, chỉ compose hook + components.
 * Palette: warm cream / terracotta (#C85C3C, #FFFAF8, #F0DDD5, #2C1810)
 */

"use client";

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
    <div className="min-h-screen bg-[#FFFAF8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4" role="status">
        <Loader2 className="animate-spin text-[#C85C3C]" size={32} />
        <p className="text-sm text-stone-600 font-medium">Đang tải...</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
/**
 * page.jsx — Trang Checkout
 * Route: /checkout
 * Palette: quầy "atelier" của TotMart — cream #FFFAF8, terracotta #C85C3C,
 * clay #F0DDD5, espresso #2C1810 (xem DESIGN.md).
 *
 * useCheckout() gọi useSearchParams() bên trong (đọc ?code= để resume sau
 * refresh — xem Ngày 3) — Next.js App Router BẮT BUỘC phần dùng
 * useSearchParams() phải nằm trong <Suspense>, nếu không `next build` lỗi
 * ngay ("missing-suspense-with-csr-bailout"). Vì vậy tách hẳn phần thân
 * trang ra CheckoutPageInner, default export chỉ còn wrap Suspense.
 */
function CheckoutPageInner() {
  const router = useRouter();
  const checkout = useCheckout();

  // Success screen
  if (checkout.orderSuccess) return <OrderSuccessScreen onNew={checkout.handleStartNew} submitting={checkout.submitting} />;

  // Loading screen
  if (!checkout.isMounted || checkout.loading || checkout.resuming)
    return <LoadingScreen />;

  return (
    <div className="tm-commerce tm-commerce--atelier min-h-screen bg-[#FFFAF8] text-[#2C1810]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Quay lại"
            className="grid place-items-center min-w-11 min-h-11 rounded-full border border-[#F0DDD5] bg-white text-[#2C1810] hover:border-[#C85C3C]/60 hover:text-[#B14B2D] transition-colors duration-200"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#2C1810] leading-tight">
              Thanh toán
            </h1>
            {checkout.hasProducts && (
              <p className="text-sm text-stone-500 mt-0.5">
                {checkout.cartItems.length} loại · {checkout.cartCount} sản phẩm
              </p>
            )}
          </div>
        </div>

        {checkout.pendingAttempt?.state === 'created' && <div className="tm-notice mb-4"><p>Giao dịch đã tồn tại: {checkout.pendingAttempt.result?.orderCode}</p><button className="tm-button tm-button--primary" disabled={checkout.submitting} onClick={checkout.handleStartNew}>Đặt đơn mới</button><Link className="tm-text-button ml-4" href={`/checkout?code=${encodeURIComponent(checkout.pendingAttempt.result?.orderCode || '')}`}>Xem / thanh toán đơn cũ</Link></div>}
        {checkout.pendingAttempt && !checkout.paymentCode && <section role="status" className="tm-notice mb-8">
          <h2>{checkout.pendingAttempt.state === 'created' ? 'Đơn hàng đã được tạo' : 'Kiểm tra yêu cầu đặt hàng trước'}</h2>
          <p className="mt-3">{checkout.pendingAttempt.state === 'created' ? 'Bạn có thể xem đơn cũ hoặc chủ động đặt đơn mới.' : 'Giữ nguyên reference cho đến khi BE xác nhận kết quả hoặc kết thúc lần thử.'}</p>
          <ul className="mt-4 space-y-2">{checkout.pendingAttempt.summary?.items?.map((item, i) => <li key={i} className="flex justify-between gap-4"><span>{item.name}</span><span className="shrink-0">× {item.quantity}</span></li>)}</ul>
          <dl>
            <div><dt>Tổng yêu cầu cũ</dt><dd>{Number.isFinite(checkout.pendingAttempt.summary?.totalAmount) ? checkout.pendingAttempt.summary.totalAmount.toLocaleString('vi-VN') + ' ₫' : 'Chưa lưu — cần đối chiếu'}</dd></div>
            <div><dt>Địa chỉ cũ đã che</dt><dd>{checkout.pendingAttempt.summary?.address || 'Chưa lưu — cần đối chiếu'}</dd></div>
            <div><dt>Thời điểm gửi</dt><dd>{checkout.pendingAttempt.sentAt ? new Date(checkout.pendingAttempt.sentAt).toLocaleString('vi-VN') : 'Chưa lưu'}</dd></div>
          </dl>
          {checkout.pendingDraftChanged && <p role="alert" className="mb-3 font-semibold">Giỏ hàng hoặc địa chỉ hiện tại đã khác. Tiếp tục chỉ xử lý yêu cầu cũ; thay đổi hiện tại không được gửi.</p>}
          {(needsReconciliation(checkout.pendingAttempt)) && <p role="alert" className="mb-3">Cần TotMart xác minh yêu cầu trước. Chưa thể gửi lại hay bắt đầu lần thử mới. Lịch sử đơn hàng không chứng minh yêu cầu chưa được tạo.</p>}
          {checkout.pendingAttempt.snapshot && <p className="mt-3">Địa chỉ BE xác nhận: {[checkout.pendingAttempt.snapshot.fullName, checkout.pendingAttempt.snapshot.address, checkout.pendingAttempt.snapshot.district, checkout.pendingAttempt.snapshot.city, checkout.pendingAttempt.snapshot.phone].filter(Boolean).join(', ')}</p>}
          <p>Trạng thái: {checkout.pendingAttempt.state || 'chưa xác định'}</p>
          {checkout.pendingAttempt.error?.message && <p role="alert">{checkout.pendingAttempt.error.message}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            {checkout.pendingAttempt.hash && checkout.pendingAttempt.state !== 'created' && checkout.pendingAttempt.state !== 'rejected' && <button className="tm-button tm-button--primary" disabled={checkout.submitting} onClick={event => checkout.handlePlaceOrder(event, { confirm: true })}>Xác nhận đúng địa chỉ và tổng tiền trên</button>}
            {checkout.pendingAttempt.state !== 'created' && <button className="tm-button tm-button--outline" disabled={checkout.submitting} onClick={event => checkout.handlePlaceOrder(event, { terminate: true })}>Kết thúc lần thử</button>}
          </div>
          <p className="tm-notice__reference">Mã đối chiếu: {checkout.pendingAttempt.key}</p>
          <p className="mt-2 text-sm">Khi liên hệ TotMart, cung cấp mã này để kiểm tra đúng yêu cầu.</p>
          <div className="mt-5 flex flex-wrap gap-3"><button type="button" className="tm-button tm-button--outline" disabled={checkout.submitting || needsReconciliation(checkout.pendingAttempt)} onClick={checkout.handlePlaceOrder}>{checkout.submitting ? 'Đang kiểm tra…' : 'Tiếp tục đúng yêu cầu cũ'}</button><Link href="/pages/contact-us" className="tm-text-button">Liên hệ TotMart</Link></div>
        </section>}
        {/* ── Stepper ── */}
        <CheckoutStepper
          currentStep={checkout.step}
          onGoBack={(id) => checkout.setStep(id)}
        />

        {/* ── Layout 2 cột ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8">
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
