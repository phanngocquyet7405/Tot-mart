/**
 * page.js — Trang Checkout
 * Route: /checkout
 *
 * Pure orchestrator: không chứa logic, chỉ compose hook + components.
 * Palette: warm cream / terracotta (#C85C3C, #FFFAF8, #F0DDD5, #2C1810)
 */

"use client";

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
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#C85C3C]" size={32} />
        <p className="text-sm text-stone-400 font-medium">Đang tải...</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const checkout = useCheckout();

  // Success screen
  if (checkout.orderSuccess) return <OrderSuccessScreen />;

  // Loading screen
  if (!checkout.isMounted || checkout.loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FFFAF8] text-[#2C1810]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C85C3C]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-[#F0DDD5]/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full border-2 border-[#F0DDD5] flex items-center justify-center text-stone-400 hover:border-[#C85C3C]/40 hover:text-[#C85C3C] transition-all bg-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#2C1810] tracking-tight">
              Thanh toán
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {checkout.hasProducts && `${checkout.cartCount} sản phẩm`}
              {checkout.hasProducts && checkout.hasSubscribes && " · "}
              {checkout.hasSubscribes &&
                `${checkout.subscribeCount} gói subscribe`}
            </p>
          </div>
        </div>

        {/* ── Stepper ── */}
        <CheckoutStepper
          currentStep={checkout.step}
          onGoBack={(id) => checkout.setStep(id)}
        />

        {/* ── Layout 2 cột ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
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
                  subscribeItems={checkout.subscribeItems}
                  subscribeCount={checkout.subscribeCount}
                  hasProducts={checkout.hasProducts}
                  hasSubscribes={checkout.hasSubscribes}
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
                  onApplyCoupon={checkout.handleApplyCoupon}
                  onBack={() => checkout.setStep("review")}
                  onPlaceOrder={checkout.handlePlaceOrder}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Cột phải — Summary */}
          <OrderSummary
            cartItems={checkout.cartItems}
            subscribeItems={checkout.subscribeItems}
            hasProducts={checkout.hasProducts}
            hasSubscribes={checkout.hasSubscribes}
            cartTotal={checkout.cartTotal}
            subscribeTotal={checkout.subscribeTotal}
            shippingFee={checkout.shippingFee}
            discount={checkout.discount}
            finalTotal={checkout.finalTotal}
          />
        </div>
      </div>
    </div>
  );
}
