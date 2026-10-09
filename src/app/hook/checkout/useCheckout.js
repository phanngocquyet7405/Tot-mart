"use client";

import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AppContext } from "@/app/context/AppContext";
import { useCart } from "@/app/context/CartContext";
import {
  loadCheckoutUser,
  validateCoupon,
  quoteCart,
  calcShippingFee,
  placeOrder,
  pollPaymentStatus,
  checkPaymentNow,
  EMPTY_NEW_ADDRESS,
} from "@/app/services/api/Checkoutpageservice";

export function useCheckout() {
  const router = useRouter();
  const { isLoading: sessionLoading } = useContext(AppContext);
  const searchParams = useSearchParams();
  const resumeCode = searchParams.get("code");
  const {
    cartItems,
    cartVersion, setCartVersion,
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
  const [resuming, setResuming] = useState(Boolean(resumeCode));

  // ── Thanh toán online (SePay QR) ──
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [paymentCode, setPaymentCode] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [onlineAmount, setOnlineAmount] = useState(0);
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
  const [quote, setQuote] = useState(null);
  const [quoteGeneration, setQuoteGeneration] = useState(0);

  const submittingRef = useRef(false);
  const recheckingRef = useRef(false);
  const mounted = useRef(false);
  const activeCodeRef = useRef(null);

  const hasProducts = cartItems.length > 0;
  const shippingFee = quote?.shippingFee ?? calcShippingFee(cartTotal, hasProducts);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (sessionLoading) return;
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
  }, [router, sessionLoading]);

  useEffect(() => {
    if (!isMounted || !user || !cartItems.length || paymentCode || resumeCode) return;
    let active = true;
    setQuote(null);
    quoteCart(cartItems, couponApplied ? coupon : undefined).then(data => {
      if (active) { setQuote(data); setDiscount(data.discountAmount); }
    }).catch(err => { if (active) toast.error(err.response?.data?.message || 'Không lấy được báo giá'); });
    return () => { active = false; };
  }, [isMounted, user, cartItems, paymentCode, resumeCode, couponApplied, coupon, quoteGeneration]);

  // ── Kết thúc: đã thanh toán / đơn bị huỷ ──
  // Giỏ hàng đã được xoá ngay lúc tạo đơn (BE tiêu thụ giỏ) nên không xoá lại ở đây.
  const finishPaid = useCallback(() => {
    setPaymentStatus("paid");
    setOrderSuccess(true);
  }, []);

  const handleCancelled = useCallback(() => {
    activeCodeRef.current = null;
    setPaymentStatus("idle");
    setPaymentCode(null);
    setQrUrl("");
    setOnlineAmount(0);
    toast.error(
      "Đơn đã bị huỷ hoặc hết hạn thanh toán. Vui lòng không chuyển khoản cho mã này.",
    );
    router.replace("/");
  }, [router]);

  // ── Khôi phục đơn sau refresh: /checkout?code=<paymentCode> ──
  useEffect(() => {
    if (!resumeCode || activeCodeRef.current === resumeCode) return;
    let active = true;
    checkPaymentNow(resumeCode)
      .then((info) => {
        if (!active) return;
        if (info.status === "error") {
          toast.error(
            "Không thể khôi phục đơn. Vui lòng kiểm tra lịch sử đơn hàng.",
          );
          router.replace("/profile/orders");
          return;
        }
        if (info.status === "paid") {
          activeCodeRef.current = resumeCode;
          finishPaid();
          return;
        }
        if (info.cancelled) {
          handleCancelled();
          return;
        }
        if (!info.qrUrl) {
          // Đơn không phải online-pending (vd. COD) → không có gì để quét
          toast.error("Đơn này không có mã QR để thanh toán.");
          router.replace("/profile/orders");
          return;
        }
        activeCodeRef.current = resumeCode;
        setPaymentMethod("online");
        setPaymentCode(resumeCode);
        setQrUrl(info.qrUrl);
        setOnlineAmount(info.totalAmount);
        setPaymentStatus("awaiting_payment");
        setStep("payment");
      })
      .finally(() => {
        if (active) setResuming(false);
      });
    return () => {
      active = false;
    };
  }, [resumeCode, router, finishPaid, handleCancelled]);

  // ── Chưa có giỏ hàng và không có đơn đang chờ → về trang chủ ──
  useEffect(() => {
    if (
      isMounted &&
      !loading &&
      !resuming &&
      !resumeCode &&
      !paymentCode &&
      cartCount === 0 &&
      !orderSuccess
    )
      router.replace("/");
  }, [
    isMounted,
    loading,
    resuming,
    resumeCode,
    paymentCode,
    cartCount,
    orderSuccess,
    router,
  ]);

  // ── Polling trạng thái thanh toán khi đang hiện QR ──
  useEffect(() => {
    if (!paymentCode || paymentStatus !== "awaiting_payment") return;
    return pollPaymentStatus(paymentCode, {
      onStatusChange: ({ status }) => {
        if (status === "paid") finishPaid();
        else if (status === "cancelled") handleCancelled();
        else if (status === "timeout") setPaymentStatus("timeout");
      },
    });
  }, [paymentCode, paymentStatus, pollAttempt, finishPaid, handleCancelled]);

  const handlePlaceOrder = useCallback(
    async (event) => {
      event?.preventDefault();
      if (submittingRef.current) return;
      // Đơn đã tạo ở BE: không tạo đơn thay thế, chỉ hiện lại màn QR
      if (paymentCode) {
        setPaymentStatus("awaiting_payment");
        return;
      }
      if (resumeCode) {
        toast.error("Vui lòng tải lại để kiểm tra đơn hiện tại.");
        return;
      }
      if (!quote) { toast.error("Vui lòng chờ báo giá hoặc kiểm tra lại giỏ hàng."); return; }
      if (addingNew || !selectedAddress) {
        toast.error("Vui lòng chọn địa chỉ đã lưu trong tài khoản.");
        return;
      }
      submittingRef.current = true;
      setSubmitting(true);
      try {
        const result = await placeOrder({
          addressId: selectedAddress._id,
          paymentMethod,
          note,
          couponCode: couponApplied ? coupon : undefined,
          cartItems, cartVersion, quoteFingerprint: quote.fingerprint,
        });
        if (!mounted.current) return;
        if (!result.success) {
          if (result.cartVersion !== undefined) setCartVersion(result.cartVersion);
          if (result.status === 409) { setQuote(null); setQuoteGeneration(value => value + 1); }
          result.skipped?.forEach(removeFromCart);
          throw new Error(result.error || "Không thể đặt hàng.");
        }
        if (paymentMethod === "cod") {
          clearCart();
          setOrderSuccess(true);
          return;
        }

        // ── Online: lấy qrUrl từ BE ──
        const code = result.orderCode;
        activeCodeRef.current = code;
        const info = await checkPaymentNow(code);
        if (!mounted.current) return;
        if (info.status === "error") {
          // Đơn đã tạo; vẫn vào màn QR — nút "kiểm tra lại" sẽ lấy lại qrUrl
          toast.error(
            'Đã tạo đơn nhưng chưa lấy được mã QR. Bấm "kiểm tra lại" để thử lần nữa.',
          );
        }
        setPaymentCode(code);
        setQrUrl(info.qrUrl ?? "");
        setOnlineAmount(result.totalAmount ?? info.totalAmount ?? 0);
        setPaymentStatus(info.status === "paid" ? "paid" : "awaiting_payment");
        // Giỏ đã được tiêu thụ ở BE; giữ paymentCode trên URL để khôi phục sau refresh
        clearCart();
        router.replace(`/checkout?code=${encodeURIComponent(code)}`);
        if (info.status === "paid") setOrderSuccess(true);
      } catch (error) {
        if (mounted.current) toast.error(error.message);
      } finally {
        submittingRef.current = false;
        if (mounted.current) setSubmitting(false);
      }
    },
    [
      paymentCode,
      resumeCode,
      addingNew,
      selectedAddress,
      paymentMethod,
      note,
      couponApplied,
      coupon,
      cartItems, cartVersion, quote, setCartVersion,
      removeFromCart,
      clearCart,
      router,
    ],
  );

  const handleApplyCoupon = async () => {
    const result = await validateCoupon(coupon, cartItems);
    if (result.quote) setQuote(result.quote);
    setDiscount(result.valid ? result.discount : 0);
    setCouponApplied(result.valid);
    if (result.valid) toast.success(result.message);
    else toast.error(result.message);
  };

  const handleRecheckPayment = useCallback(async () => {
    if (!paymentCode || recheckingRef.current) return;
    recheckingRef.current = true;
    try {
      const info = await checkPaymentNow(paymentCode);
      if (!mounted.current) return;
      if (info.status === "error") {
        toast.error(info.error);
        return;
      }
      if (info.status === "paid") {
        finishPaid();
        return;
      }
      if (info.cancelled) {
        handleCancelled();
        return;
      }
      if (info.qrUrl) setQrUrl(info.qrUrl);
      setPaymentStatus("awaiting_payment");
      setPollAttempt((value) => value + 1);
      toast.info("Chưa nhận được thanh toán. Hệ thống sẽ tiếp tục kiểm tra.");
    } finally {
      recheckingRef.current = false;
    }
  }, [paymentCode, finishPaid, handleCancelled]);

  return {
    cartItems: quote ? cartItems.map(item => { const line = quote.lines.find(line => line.itemId === String(item._id || item.id) && line.itemType === (item.itemType || "product")); return line ? { ...item, price: line.unitPrice } : item; }) : cartItems,
    cartTotal: quote?.subtotal ?? cartTotal,
    cartCount,
    hasProducts,
    shippingFee,
    discount,
    finalTotal: quote?.totalAmount ?? cartTotal - discount + shippingFee,
    step,
    setStep,
    loading,
    submitting,
    orderSuccess,
    resuming,
    isMounted,
    paymentStatus,
    paymentCode,
    qrUrl,
    onlineAmount,
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
    setCoupon: value => { setCoupon(value); setCouponApplied(false); setDiscount(0); },
    couponApplied,
    handleApplyCoupon,
    handlePlaceOrder,
  };
}
