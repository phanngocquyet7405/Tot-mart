/**
 * page.js — Trang Checkout
 * Route: /checkout
 *
 * Pure orchestrator: không chứa logic, chỉ compose hook + components.
 * Palette: warm cream / terracotta (#C85C3C, #FFFAF8, #F0DDD5, #2C1810)
 */

"use client";

import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
  if (checkout.orderSuccess) return <OrderSuccessScreen />;

  // Loading screen
  if (!checkout.isMounted || checkout.loading || checkout.resuming)
    return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FFFAF8] text-[#2C1810]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Quay lại"
            className="grid place-items-center w-10 h-10 rounded-full border border-[#F0DDD5] bg-white text-[#2C1810] hover:border-[#C85C3C]/60 hover:text-[#B14B2D] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C85C3C]"
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
                  onNext={() => checkout.setStep("review")}
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
