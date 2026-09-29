"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";
import {
  loadCheckoutUser,
  validateCoupon,
  calcShippingFee,
  placeOrder,
  EMPTY_NEW_ADDRESS,
} from "@/app/services/api/Checkoutpageservice";
import {
  buildVietQrUrl,
  getPaymentOrder,
  pollOrderPayment,
} from "@/app/services/api/qrPaymentService";

export function useCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("orderId");
  const {
    cartItems,
    cartTotal,
    cartCount,
    isMounted,
    clearCart,
    removeFromCart,
  } = useCart();
  const [step, setStep] = useState("address");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [resuming, setResuming] = useState(Boolean(resumeId));
  const [orderInfo, setOrderInfo] = useState(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [paymentError, setPaymentError] = useState("");
  const [pollAttempt, setPollAttempt] = useState(0);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_NEW_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const submittingRef = useRef(false);
  const mounted = useRef(false);
  const hasProducts = cartItems.length > 0;
  const shippingFee = calcShippingFee(cartTotal, hasProducts);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadCheckoutUser().then((result) => {
      if (!active) return;
      if (!result.success) {
        toast.error("Vui lòng đăng nhập để thanh toán");
        if (result.error === "NO_TOKEN") router.replace("/login");
      } else {
        setUser(result.user);
        setAddresses(result.addresses);
        setSelectedAddress(result.addresses[0] ?? null);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [router]);

  // Resume the same checkout after refresh; never create a replacement order.
  useEffect(() => {
    if (!resumeId) return;
    const controller = new AbortController();
    getPaymentOrder(resumeId, controller.signal)
      .then((info) => {
        if (controller.signal.aborted) return;
        if (info.status === "paid") {
          router.replace(
            `/checkout/success?orderId=${encodeURIComponent(resumeId)}`,
          );
          return;
        }
        setOrderInfo(info);
        setPaymentMethod("online");
        setStep("payment");
        setIsQrOpen(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setPaymentError(error?.response?.data?.message || error.message);
          toast.error(
            "Không thể khôi phục đơn. Vui lòng kiểm tra lịch sử đơn hàng.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setResuming(false);
      });
    return () => controller.abort();
  }, [resumeId, router]);

  useEffect(() => {
    if (
      isMounted &&
      !loading &&
      !resuming &&
      !resumeId &&
      !orderInfo &&
      cartCount === 0 &&
      !orderSuccess
    )
      router.replace("/");
  }, [
    isMounted,
    loading,
    resuming,
    resumeId,
    orderInfo,
    cartCount,
    orderSuccess,
    router,
  ]);

  useEffect(() => {
    if (!isQrOpen || !orderInfo?.orderId) return;
    return pollOrderPayment(orderInfo.orderId, {
      onPaid: () => {
        setIsQrOpen(false);
        setPaymentStatus("paid");
        router.replace(
          `/checkout/success?orderId=${encodeURIComponent(orderInfo.orderId)}`,
        );
      },
      onError: (error) => {
        setPaymentStatus("error");
        setPaymentError(error?.response?.data?.message || error.message);
      },
    });
  }, [isQrOpen, orderInfo?.orderId, pollAttempt, router]);

  const handlePlaceOrder = useCallback(
    async (event) => {
      event?.preventDefault();
      if (submittingRef.current) return;
      if (orderInfo) {
        setPaymentError("");
        setIsQrOpen(true);
        return;
      }
      if (resumeId) {
        toast.error("Vui lòng tải lại để kiểm tra đơn hiện tại.");
        return;
      }
      if (addingNew || !selectedAddress) {
        toast.error("Vui lòng chọn địa chỉ đã lưu trong tài khoản.");
        return;
      }
      // Fail configuration checks BEFORE committing a checkout.
      if (paymentMethod === "online") {
        try {
          buildVietQrUrl({ totalAmount: 1, orderCode: "CHECK" });
        } catch (error) {
          toast.error(error.message);
          return;
        }
      }
      submittingRef.current = true;
      setSubmitting(true);
      try {
        const result = await placeOrder({
          addressId: selectedAddress._id,
          paymentMethod,
          note,
          couponCode: couponApplied ? coupon : undefined,
          cartItems,
        });
        if (!mounted.current) return;
        if (!result.success) {
          result.skipped?.forEach(removeFromCart);
          throw new Error(result.error || "Không thể đặt hàng.");
        }
        if (paymentMethod === "cod") {
          clearCart();
          setOrderSuccess(true);
          return;
        }
        const info = {
          orderId: result.orderId,
          orderCode: result.orderCode,
          totalAmount: result.totalAmount,
        };
        setOrderInfo(info);
        setPaymentStatus("awaiting_payment");
        setPaymentError("");
        setIsQrOpen(true);
        // The cart has been consumed on the server; keep the order ID for recovery.
        clearCart();
        router.replace(`/checkout?orderId=${encodeURIComponent(info.orderId)}`);
      } catch (error) {
        if (mounted.current) toast.error(error.message);
      } finally {
        submittingRef.current = false;
        if (mounted.current) setSubmitting(false);
      }
    },
    [
      orderInfo,
      resumeId,
      addingNew,
      selectedAddress,
      paymentMethod,
      note,
      couponApplied,
      coupon,
      cartItems,
      removeFromCart,
      clearCart,
      router,
    ],
  );

  const handleApplyCoupon = () => {
    const result = validateCoupon(coupon, cartTotal);
    setDiscount(result.valid ? result.discount : 0);
    setCouponApplied(result.valid);
    if (result.valid) toast.success(result.message);
    else toast.error(result.message);
  };
  const handleRecheckPayment = () => {
    setPaymentError("");
    setPaymentStatus("awaiting_payment");
    setPollAttempt((value) => value + 1);
  };
  return {
    cartItems,
    cartTotal,
    cartCount,
    hasProducts,
    shippingFee,
    discount,
    finalTotal: cartTotal - discount + shippingFee,
    step,
    setStep,
    loading,
    submitting,
    orderSuccess,
    paymentStatus,
    paymentError,
    resuming,
    isMounted,
    orderInfo,
    isQrOpen,
    setIsQrOpen,
    handleRecheckPayment,
    user,
    addresses,
    displayedAddresses: showAllAddresses ? addresses : addresses.slice(0, 2),
    selectedAddress,
    showAllAddresses,
    setShowAllAddresses,
    addingNew,
    newAddress,
    handleSelectAddress: (address) => {
      setSelectedAddress(address);
      setAddingNew(false);
    },
    handleToggleAddNew: () => {
      setAddingNew((value) => !value);
      setSelectedAddress(null);
    },
    handleNewAddressChange: (key, value) =>
      setNewAddress((previous) => ({ ...previous, [key]: value })),
    paymentMethod,
    setPaymentMethod,
    note,
    setNote,
    coupon,
    setCoupon,
    couponApplied,
    handleApplyCoupon,
    handlePlaceOrder,
  };
}
