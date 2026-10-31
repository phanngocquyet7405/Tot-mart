"use client";

import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AppContext } from "@/app/context/AppContext";
import { useCart } from "@/app/context/CartContext";
import logger from "@/app/util/Logger";
import {
  loadCheckoutUser,
  saveCheckoutAddress,
  toCartPayload,
  quoteCart,
  calcShippingFee,
  EMPTY_NEW_ADDRESS,
  createCheckoutSession,
  getCheckoutSession,
  cancelCheckoutSession,
  placeCodOrder,
  getStoredSession,
  saveStoredSession,
  clearStoredSession,
  pollPaymentStatus,
  checkPaymentNow,
} from "@/app/services/api/Checkoutpageservice";

export function useCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCode = searchParams.get("code") || searchParams.get("sessionId");

  const { isLoading: sessionLoading, user: sessionUser } = useContext(AppContext);
  const { cartItems, cartTotal, cartCount, isMounted, clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [step, setStep] = useState("address"); // "address" | "review" | "payment"

  // User & Address
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_NEW_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);

  // Quote & Coupon
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [quote, setQuote] = useState(null);
  const [quoteWarning, setQuoteWarning] = useState("");

  // Payment Selection & Session
  const [paymentMethod, setPaymentMethod] = useState("online"); // "online" | "cod"
  const [currentSession, setCurrentSession] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // "idle" | "awaiting_payment" | "paid" | "expired" | "cancelled" | "underpaid" | "timeout"
  const [paymentCode, setPaymentCode] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [expiresAt, setExpiresAt] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Refs
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);

  const hasProducts = cartItems.length > 0;
  const shippingFee = quote?.shippingFee ?? calcShippingFee();
  const bulkDiscountAmount = quote?.bulkDiscountAmount || 0;
  const giftFee = quote?.giftFee || 0;
  const finalTotal = quote?.totalAmount ?? (cartTotal - discount + giftFee);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 1. Tải user và địa chỉ đã lưu
  useEffect(() => {
    if (sessionLoading) return;
    let active = true;

    loadCheckoutUser().then((result) => {
      if (!active) return;
      if (!result.success) {
        toast.error("Vui lòng đăng nhập để tiếp tục thanh toán.");
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
  }, [router, sessionLoading, sessionUser]);

  // 2. Khôi phục session pending nếu có (sau khi F5 hoặc url có code)
  useEffect(() => {
    if (sessionLoading || loading) return;

    let targetCode = urlCode;
    if (!targetCode) {
      const stored = getStoredSession();
      if (stored?.paymentCode || stored?.sessionId) {
        targetCode = stored.paymentCode || stored.sessionId;
      }
    }

    if (!targetCode) return;

    let active = true;
    checkPaymentNow(targetCode)
      .then((info) => {
        if (!active) return;
        if (info.status === "error") {
          clearStoredSession();
          return;
        }

        if (info.status === "paid") {
          clearStoredSession();
          setPaymentStatus("paid");
          setOrderSuccess(true);
          return;
        }

        if (info.expired || (info.expiresAt && new Date(info.expiresAt) <= new Date())) {
          clearStoredSession();
          setPaymentMethod("online");
          setPaymentCode(info.paymentCode);
          setPaymentStatus("expired");
          setIsExpired(true);
          setStep("payment");
          return;
        }

        if (info.status === "cancelled") {
          clearStoredSession();
          setPaymentStatus("cancelled");
          return;
        }

        // Session pending còn hạn -> khôi phục màn hình QR
        const restored = {
          sessionId: info.sessionId,
          paymentCode: info.paymentCode,
          qrUrl: info.qrUrl,
          totalAmount: info.remainingAmount || info.totalAmount,
          expiresAt: info.expiresAt,
        };
        saveStoredSession(restored);
        setCurrentSession(restored);
        setPaymentMethod("online");
        setPaymentCode(info.paymentCode);
        setQrUrl(info.qrUrl || "");
        setOnlineAmount(info.remainingAmount || info.totalAmount);
        setExpiresAt(info.expiresAt);
        setIsExpired(false);
        setPaymentStatus("awaiting_payment");
        setStep("payment");
      })
      .catch((err) => {
        logger.error("Lỗi khôi phục session:", err);
      });

    return () => {
      active = false;
    };
  }, [sessionLoading, loading, urlCode]);

  // 3. Tự động chuyển về trang chủ nếu giỏ hàng rỗng và không có session pending
  useEffect(() => {
    if (
      isMounted &&
      !loading &&
      !currentSession &&
      !urlCode &&
      cartCount === 0 &&
      !orderSuccess
    ) {
      router.replace("/");
    }
  }, [isMounted, loading, currentSession, urlCode, cartCount, orderSuccess, router]);

  // 4. Lấy báo giá chuẩn từ BE
  useEffect(() => {
    if (!isMounted || !user || !cartItems.length || currentSession) return;
    let active = true;
    setQuoteWarning("");

    quoteCart(cartItems, couponApplied ? coupon : undefined)
      .then((data) => {
        if (!active) return;
        setQuote(data);
        setDiscount(data.discountAmount || 0);
      })
      .catch((err) => {
        if (!active) return;
        const msg = err.response?.data?.message || "Không thể tải báo giá đơn hàng.";
        setQuoteWarning(msg);
      });

    return () => {
      active = false;
    };
  }, [isMounted, user, cartItems, couponApplied, coupon, currentSession]);

  // 5. Polling trạng thái thanh toán khi session QR đang active
  useEffect(() => {
    const activeTarget = paymentCode || currentSession?.paymentCode || currentSession?.sessionId;
    if (!activeTarget || paymentStatus !== "awaiting_payment" || isExpired) return;

    const stopPoll = pollPaymentStatus(activeTarget, {
      intervalMs: 3000,
      onStatusChange: (info) => {
        if (info.status === "paid") {
          clearStoredSession();
          clearCart(cartItems);
          setPaymentStatus("paid");
          setOrderSuccess(true);
          toast.success("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");
        } else if (info.status === "expired" || info.expired) {
          clearStoredSession();
          setPaymentStatus("expired");
          setIsExpired(true);
        } else if (info.status === "cancelled") {
          clearStoredSession();
          setPaymentStatus("cancelled");
          setCurrentSession(null);
          setPaymentCode(null);
        } else if (info.status === "underpaid") {
          setPaymentStatus("underpaid");
          setOnlineAmount(info.remainingAmount);
          if (info.qrUrl) setQrUrl(info.qrUrl);
        }
      },
    });

    return () => {
      stopPoll();
    };
  }, [paymentCode, currentSession, paymentStatus, isExpired, clearCart, cartItems]);

  // Áp dụng mã giảm giá
  const handleApplyCoupon = useCallback(async () => {
    if (!coupon.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const data = await quoteCart(cartItems, coupon);
      setQuote(data);
      setDiscount(data.discountAmount || 0);
      setCouponApplied(true);
      toast.success("Đã áp dụng mã giảm giá thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết lượt.");
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) setSubmitting(false);
    }
  }, [coupon, cartItems]);

  // Xử lý tạo đơn / phiên thanh toán (COD hoặc QR)
  const handlePlaceOrder = useCallback(
    async (e) => {
      e?.preventDefault();
      if (submittingRef.current) return; // Chặn double click

      if (!selectedAddress?._id) {
        toast.error("Vui lòng chọn địa chỉ nhận hàng.");
        setStep("address");
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);

      try {
        if (paymentMethod === "cod") {
          // LUỒNG COD
          const res = await placeCodOrder({
            addressId: selectedAddress._id,
            note,
            couponCode: couponApplied ? coupon : undefined,
            quoteFingerprint: quote?.fingerprint,
          });

          if (mountedRef.current) {
            clearStoredSession();
            clearCart(cartItems);
            setOrderSuccess(true);
            toast.success("Đặt hàng thành công! TotMart sẽ liên hệ xác nhận đơn hàng.");
          }
        } else {
          // LUỒNG QR SESSION
          const res = await createCheckoutSession({
            addressId: selectedAddress._id,
            note,
            couponCode: couponApplied ? coupon : undefined,
            quoteFingerprint: quote?.fingerprint,
          });

          const data = res?.data || res;
          const sessionData = {
            sessionId: data.sessionId,
            paymentCode: data.paymentCode || data.orderCode,
            qrUrl: data.qrUrl,
            totalAmount: data.totalAmount,
            expiresAt: data.expiresAt,
          };

          if (mountedRef.current) {
            saveStoredSession(sessionData);
            setCurrentSession(sessionData);
            setPaymentCode(sessionData.paymentCode);
            setQrUrl(sessionData.qrUrl);
            setOnlineAmount(sessionData.totalAmount);
            setExpiresAt(sessionData.expiresAt);
            setIsExpired(false);
            setPaymentStatus("awaiting_payment");
            setStep("payment");

            // Cập nhật URL để reload vẫn giữ session
            router.replace(`/checkout?code=${encodeURIComponent(sessionData.paymentCode)}`);
          }
        }
      } catch (err) {
        logger.error("Lỗi tạo đơn:", err);
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;

        if (status === 409) {
          setQuoteWarning("Giá hoặc giỏ hàng đã thay đổi. Vui lòng kiểm tra lại báo giá.");
          toast.error("Giá hoặc giỏ hàng đã thay đổi. Vui lòng kiểm tra lại.");
        } else {
          toast.error(msg || "Không thể thực hiện yêu cầu đặt hàng.");
        }
      } finally {
        submittingRef.current = false;
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [selectedAddress, paymentMethod, note, couponApplied, coupon, quote, clearCart, cartItems, router]
  );

  // Huỷ session (Đổi phương thức thanh toán)
  const handleCancelSession = useCallback(async () => {
    if (submittingRef.current) return;
    const activeTarget = currentSession?.sessionId || paymentCode;
    if (!activeTarget) {
      setCurrentSession(null);
      setPaymentCode(null);
      setPaymentStatus("idle");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await cancelCheckoutSession(activeTarget, "Khách đổi phương thức thanh toán");
      clearStoredSession();
      setCurrentSession(null);
      setPaymentCode(null);
      setQrUrl("");
      setExpiresAt(null);
      setIsExpired(false);
      setPaymentStatus("idle");
      router.replace("/checkout");
      toast.info("Đã huỷ phiên thanh toán cũ. Bạn có thể chọn phương thức khác.");
    } catch (err) {
      logger.error("Lỗi huỷ session:", err);
      // Dù lỗi mạng thì client vẫn cho phép dọn session để người dùng không bị kẹt
      clearStoredSession();
      setCurrentSession(null);
      setPaymentCode(null);
      setPaymentStatus("idle");
      router.replace("/checkout");
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) setSubmitting(false);
    }
  }, [currentSession, paymentCode, router]);

  // Tạo lại mã QR khi hết hạn
  const handleRecreateSession = useCallback(async () => {
    if (submittingRef.current) return;
    setIsExpired(false);
    setPaymentStatus("idle");
    setCurrentSession(null);
    clearStoredSession();
    await handlePlaceOrder();
  }, [handlePlaceOrder]);

  // Kiểm tra thủ công ngay lập tức
  const handleRecheckPayment = useCallback(async () => {
    if (submittingRef.current) return;
    const activeTarget = paymentCode || currentSession?.paymentCode || currentSession?.sessionId;
    if (!activeTarget) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const info = await checkPaymentNow(activeTarget);
      if (info.status === "paid") {
        clearStoredSession();
        clearCart(cartItems);
        setPaymentStatus("paid");
        setOrderSuccess(true);
        toast.success("Thanh toán thành công!");
      } else if (info.status === "expired" || info.expired) {
        clearStoredSession();
        setIsExpired(true);
        setPaymentStatus("expired");
        toast.warning("Mã QR này đã hết thời gian hiệu lực.");
      } else if (info.status === "underpaid") {
        setPaymentStatus("underpaid");
        setOnlineAmount(info.remainingAmount);
        toast.info(`Đã nhận một phần thanh toán. Số tiền còn lại: ${info.remainingAmount.toLocaleString("vi-VN")} ₫`);
      } else {
        toast.info("Hệ thống vẫn đang chờ nhận chuyển khoản. Vui lòng hoàn tất trong app ngân hàng.");
      }
    } catch (err) {
      toast.error("Không thể kiểm tra giao dịch vào lúc này. Vui lòng thử lại sau.");
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) setSubmitting(false);
    }
  }, [paymentCode, currentSession, clearCart, cartItems]);

  // Bắt đầu đơn hàng mới
  const handleStartNew = useCallback(() => {
    clearStoredSession();
    setCurrentSession(null);
    setPaymentCode(null);
    setOrderSuccess(false);
    setPaymentStatus("idle");
    setStep("address");
    router.replace("/");
  }, [router]);

  // Chuyển bước địa chỉ
  const handleAddressNext = useCallback(async () => {
    if (savingAddress) return;
    if (!addingNew) {
      if (selectedAddress) setStep("review");
      else toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    setSavingAddress(true);
    try {
      const result = await saveCheckoutAddress(user, newAddress);
      if (!mountedRef.current) return;
      setAddresses(result.addresses);
      setSelectedAddress(result.selected);
      setAddingNew(false);
      setNewAddress(EMPTY_NEW_ADDRESS);
      setStep("review");
      toast.success("Đã thêm và chọn địa chỉ mới.");
    } catch (err) {
      toast.error(err.message || "Không thể lưu địa chỉ.");
    } finally {
      if (mountedRef.current) setSavingAddress(false);
    }
  }, [savingAddress, addingNew, selectedAddress, user, newAddress]);

  const displayedAddresses = showAllAddresses ? addresses : addresses.slice(0, 3);

  return {
    isMounted,
    loading,
    submitting,
    orderSuccess,
    step,
    setStep,
    user,
    addresses,
    displayedAddresses,
    selectedAddress,
    handleSelectAddress: setSelectedAddress,
    showAllAddresses,
    setShowAllAddresses,
    addingNew,
    handleToggleAddNew: () => setAddingNew((v) => !v),
    newAddress,
    handleNewAddressChange: (field, value) => setNewAddress((prev) => ({ ...prev, [field]: value })),
    savingAddress,
    handleAddressNext,
    note,
    setNote,
    coupon,
    setCoupon,
    couponApplied,
    handleApplyCoupon,
    discount,
    quote,
    quoteWarning,
    cartItems,
    cartTotal,
    cartCount,
    hasProducts,
    shippingFee,
    giftFee,
    bulkDiscountAmount,
    finalTotal,
    paymentMethod,
    setPaymentMethod,
    currentSession,
    paymentStatus,
    paymentCode,
    qrUrl,
    onlineAmount,
    expiresAt,
    isExpired,
    handlePlaceOrder,
    handleCancelSession,
    handleRecreateSession,
    handleRecheckPayment,
    handleStartNew,
  };
}
