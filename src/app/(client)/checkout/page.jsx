"use client";
/**
 * page.jsx — Trang Checkout
 * Route: /checkout
 *
 * Pure orchestrator: compose hook + components.
 * Chuẩn hóa token thiết kế: warm cream (bg-background, bg-card), terracotta (bg-primary, text-primary), border-border, text-foreground.
 */

import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
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

  // Màn hình hoàn tất đơn hàng
  if (checkout.orderSuccess) {
    return (
      <OrderSuccessScreen
        onNew={checkout.handleStartNew}
        submitting={checkout.submitting}
      />
    );
  }

  // Màn hình tải
  if (!checkout.isMounted || checkout.loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="tm-commerce tm-commerce--atelier min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => {
              if (checkout.step === "payment" && checkout.paymentCode) {
                checkout.handleCancelSession();
              } else if (checkout.step === "payment") {
                checkout.setStep("review");
              } else if (checkout.step === "review") {
                checkout.setStep("address");
              } else {
                router.back();
              }
            }}
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

        {/* ── Cảnh báo thay đổi giá/kho (dễ hiểu, thân thiện) ── */}
        {checkout.quoteWarning && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl border border-warning/30 bg-warning/10 text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-warning-text shrink-0" />
              <p className="text-sm font-medium">{checkout.quoteWarning}</p>
            </div>
            <Link
              href="/cart"
              className="text-xs font-bold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors shrink-0"
            >
              Xem lại giỏ hàng
            </Link>
          </div>
        )}

        {/* ── Stepper ── */}
        <CheckoutStepper
          currentStep={checkout.step}
          onGoBack={(id) => {
            // Không cho phép nhảy lùi khi đang hiển thị mã QR thanh toán chưa huỷ
            if (checkout.paymentCode) return;
            checkout.setStep(id);
          }}
        />

        {/* ── Layout 2 cột ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
          {/* Cột trái — Steps */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {/* BƯỚC 1: ĐỊA CHỈ */}
              {checkout.step === "address" && (
                <AddressStep
                  key="step-address"
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

              {/* BƯỚC 2: KIỂM TRA ĐƠN */}
              {checkout.step === "review" && (
                <ReviewStep
                  key="step-review"
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

              {/* BƯỚC 3: PHƯƠNG THỨC & MÃ QR */}
              {checkout.step === "payment" && (
                <PaymentStep
                  key="step-payment"
                  paymentMethod={checkout.paymentMethod}
                  setPaymentMethod={checkout.setPaymentMethod}
                  coupon={checkout.coupon}
                  setCoupon={checkout.setCoupon}
                  couponApplied={checkout.couponApplied}
                  discount={checkout.discount}
                  finalTotal={checkout.finalTotal}
                  submitting={checkout.submitting}
                  paymentStatus={checkout.paymentStatus}
                  paymentCode={checkout.paymentCode}
                  qrUrl={checkout.qrUrl}
                  onlineAmount={checkout.onlineAmount}
                  expiresAt={checkout.expiresAt}
                  isExpired={checkout.isExpired}
                  onApplyCoupon={checkout.handleApplyCoupon}
                  onBack={() => checkout.setStep("review")}
                  onPlaceOrder={checkout.handlePlaceOrder}
                  onCancelSession={checkout.handleCancelSession}
                  onRecreateSession={checkout.handleRecreateSession}
                  onRecheckPayment={checkout.handleRecheckPayment}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Cột phải — Summary đơn hàng */}
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
