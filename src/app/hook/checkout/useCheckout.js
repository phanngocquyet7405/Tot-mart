/**
 * useCheckout.js
 * Custom hook — toàn bộ state + logic checkout
 * Page chỉ đọc từ hook, không có business logic nào trực tiếp
 */

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
  pollPaymentStatus,
  checkPaymentNow,
  EMPTY_NEW_ADDRESS,
} from "@/app/services/api/Checkoutpageservice";

export function useCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, cartTotal, cartCount, isMounted, clearCart } = useCart();

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState("address");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  // true trong lúc đang kiểm tra ?code= trên URL lúc mount (Ngày 3 — resume
  // sau refresh). Chặn effect "redirect nếu giỏ trống" bắn nhầm trong lúc
  // chờ kết quả check, vì lúc này giỏ hàng local có thể trông như trống/không
  // liên quan trong khi đơn online vẫn đang chờ thanh toán ở BE.
  const [resuming, setResuming] = useState(() => !!searchParams.get("code"));
  // idle | awaiting_payment | paid | timeout — chỉ dùng cho luồng online
  // (SePay). "paid" kéo theo orderSuccess = true, dùng chung màn thành công
  // với COD (xem handlePaymentPaid) — không cần route riêng.
  const [paymentStatus, setPaymentStatus] = useState("idle");

  // Dữ liệu QR trả về từ BE khi paymentMethod = "online" — Payment_step.jsx
  // (Ngày 2) đọc 3 giá trị này để vẽ màn quét mã.
  const [paymentCode, setPaymentCode] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  // ⚠️ Số tiền THẬT phải chuyển khoản — lấy từ BE (grandTotalAmount), KHÔNG
  // dùng finalTotal bên dưới cho màn QR, vì BE hiện chưa cộng shippingFee
  // vào tổng (xem ghi chú ở calcShippingFee trong Checkoutpageservice.js).
  const [onlineAmount, setOnlineAmount] = useState(0);

  // Giữ hàm stop() của lượt polling đang chạy để cleanup khi unmount / rời
  // trang giữa chừng — tránh setState sau khi component đã unmount.
  const stopPollingRef = useRef(null);

  // ─── User / address ───────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_NEW_ADDRESS);

  // ─── Payment / coupon ─────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // ─── Derived ──────────────────────────────────────────────────────────────
  const hasProducts = cartItems.length > 0;
  const shippingFee = calcShippingFee(cartTotal, hasProducts);
  const finalTotal = cartTotal - discount + shippingFee;

  const displayedAddresses = showAllAddresses
    ? addresses
    : addresses.slice(0, 2);

  // ─── Load user ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const result = await loadCheckoutUser();
      if (!result.success) {
        if (result.error === "NO_TOKEN") {
          toast.error("Vui lòng đăng nhập để thanh toán");
          router.push("/login");
          return;
        }
        toast.error("Không thể tải thông tin người dùng");
      } else {
        setUser(result.user);
        setAddresses(result.addresses);
        if (result.addresses.length > 0)
          setSelectedAddress(result.addresses[0]);
      }
      setLoading(false);
    })();
  }, [router]);

  // ─── Redirect nếu giỏ trống ───────────────────────────────────────────────
  useEffect(() => {
    if (isMounted && !loading && !resuming && cartCount === 0 && !orderSuccess) {
      router.push("/");
    }
  }, [isMounted, loading, resuming, cartCount, orderSuccess, router]);

  // ─── Dọn polling khi rời trang / unmount ─────────────────────────────────
  useEffect(() => {
    return () => stopPollingRef.current?.();
  }, []);

  // ─── Coupon ───────────────────────────────────────────────────────────────
  const handleApplyCoupon = useCallback(() => {
    const result = validateCoupon(coupon, cartTotal);
    if (result.valid) {
      setDiscount(result.discount);
      setCouponApplied(true);
      toast.success(result.message);
    } else {
      setDiscount(0);
      setCouponApplied(false);
      toast.error(result.message);
    }
  }, [coupon, cartTotal]);

  // ─── SePay xác nhận đã thanh toán (do poll tự động hoặc bấm kiểm tra lại) ──
  const handlePaymentPaid = useCallback(() => {
    stopPollingRef.current?.();
    clearCart();
    setPaymentStatus("paid");
    setOrderSuccess(true);
    setSubmitting(false);
    // Dọn ?code= khỏi URL — tránh để lại mã cũ nếu user reload màn thành công.
    router.replace("/checkout");
  }, [clearCart, router]);

  const startPollingPayment = useCallback(
    (code) => {
      stopPollingRef.current?.();
      stopPollingRef.current = pollPaymentStatus(code, {
        onStatusChange: ({ status }) => {
          if (status === "paid") {
            handlePaymentPaid();
          } else if (status === "timeout") {
            setPaymentStatus("timeout");
            setSubmitting(false);
          }
        },
      });
    },
    [handlePaymentPaid],
  );

  // ─── Resume sau refresh (Ngày 3) ────────────────────────────────────────
  // Chạy đúng 1 lần lúc mount: nếu URL có ?code=, hỏi lại BE xem đơn đó ra
  // sao — vì paymentCode/qrUrl vốn chỉ là React state, refresh là mất hết.
  // Không phụ thuộc searchParams trong deps vì Next.js trả instance mới mỗi
  // render, đưa vào sẽ gây loop; giá trị chỉ cần đọc đúng 1 lần lúc mount.
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    (async () => {
      const result = await checkPaymentNow(code);

      if (result.status === "paid") {
        // Đơn đã được webhook xác nhận trong lúc user rời trang — không cần
        // clearCart() lại vì có thể trang trước đó user reload trước khi
        // handlePaymentPaid() kịp chạy; clearCart() ở đây vẫn an toàn (no-op
        // nếu giỏ đã trống).
        clearCart();
        setPaymentStatus("paid");
        setOrderSuccess(true);
        router.replace("/checkout");
      } else if (result.qrUrl) {
        // Vẫn đang chờ và BE dựng lại được QR — khôi phục đúng màn Ngày 2.
        setPaymentMethod("online");
        setPaymentCode(code);
        setQrUrl(result.qrUrl);
        setOnlineAmount(result.totalAmount ?? 0);
        setPaymentStatus("awaiting_payment");
        setStep("payment");
        setSubmitting(true);
        startPollingPayment(code);
      }
      // Không có qrUrl (mã sai/hết hạn/lỗi mạng) — bỏ qua, để user tự bắt
      // đầu đặt đơn mới từ bước "address" như bình thường.

      setResuming(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  // Nút "Tôi đã chuyển khoản, kiểm tra lại" ở Payment_step.jsx (Ngày 2) —
  // check ngay 1 lần thay vì chờ tick polling tiếp theo.
  const handleRecheckPayment = useCallback(async () => {
    if (!paymentCode) return;
    const { status } = await checkPaymentNow(paymentCode);
    if (status === "paid") {
      handlePaymentPaid();
    } else {
      toast.info(
        "Chưa nhận được thanh toán, hệ thống sẽ tự kiểm tra lại sau ít phút",
      );
    }
  }, [paymentCode, handlePaymentPaid]);

  // ─── Place order ──────────────────────────────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    // V1: chưa hỗ trợ thêm địa chỉ mới ngay lúc checkout (addressId gửi lên
    // BE phải trỏ tới địa chỉ ĐÃ TỒN TẠI trong user.addresses — xem ghi chú
    // ở placeOrder() trong Checkoutpageservice.js). Chặn sớm ở đây thay vì
    // để BE trả lỗi 400 khó hiểu cho user.
    if (addingNew) {
      toast.error(
        "Chưa hỗ trợ thêm địa chỉ mới ngay lúc thanh toán — vui lòng thêm địa chỉ trong trang Tài khoản rồi quay lại chọn.",
      );
      return;
    }
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    setSubmitting(true);
    setPaymentStatus("idle");

    const result = await placeOrder({
      addressId: selectedAddress._id,
      paymentMethod,
      note,
      couponCode: couponApplied ? coupon : undefined,
    });

    if (!result.success) {
      toast.error(result.error || "Đặt hàng thất bại, vui lòng thử lại");
      setSubmitting(false);
      return;
    }

    // COD: giữ nguyên luồng cũ — chốt đơn ngay tại đây.
    if (paymentMethod === "cod") {
      clearCart();
      setOrderSuccess(true);
      setSubmitting(false);
      return;
    }

    // Online (SePay): đơn đã ở trạng thái pending_payment ở BE, BE trả sẵn
    // qrUrl trong CHÍNH response này — không có bước "khởi tạo thanh toán"
    // riêng như initiateVnpayPayment() cũ. Không clearCart() ở đây — chỉ
    // clear khi SePay xác nhận đã thanh toán (handlePaymentPaid), để tránh
    // mất giỏ hàng nếu user rời trang giữa chừng.
    if (paymentMethod === "online") {
      setPaymentCode(result.paymentCode);
      setQrUrl(result.qrUrl);
      setOnlineAmount(result.grandTotalAmount);
      setPaymentStatus("awaiting_payment");
      // Đồng bộ paymentCode lên URL (replace, không push — không tạo thêm
      // history entry) để nếu user refresh giữa chừng, effect resume ở trên
      // vẫn khôi phục lại được đúng đơn này.
      router.replace(`/checkout?code=${result.paymentCode}`);
      startPollingPayment(result.paymentCode);
      return; // vẫn giữ submitting=true tới khi paid/timeout — Payment_step.jsx tự khoá nút theo paymentStatus
    }

    // Các phương thức khác (momo) chưa wire — không nên tới được đây vì
    // PaymentStep đã disable lựa chọn không available.
    setSubmitting(false);
  }, [
    addingNew,
    selectedAddress,
    paymentMethod,
    note,
    couponApplied,
    coupon,
    clearCart,
    router,
    startPollingPayment,
  ]);

  // ─── Address helpers ──────────────────────────────────────────────────────
  const handleSelectAddress = useCallback((addr) => {
    setSelectedAddress(addr);
    setAddingNew(false);
  }, []);

  const handleToggleAddNew = useCallback(() => {
    setAddingNew((p) => !p);
    setSelectedAddress(null);
  }, []);

  const handleNewAddressChange = useCallback((key, value) => {
    setNewAddress((p) => ({ ...p, [key]: value }));
  }, []);

  return {
    // Cart
    cartItems,
    cartTotal,
    cartCount,
    hasProducts,
    shippingFee,
    finalTotal,
    discount,
    // UI
    step,
    setStep,
    loading,
    submitting,
    orderSuccess,
    paymentStatus,
    resuming,
    isMounted,
    // SePay QR (Ngày 2 dùng)
    paymentCode,
    qrUrl,
    onlineAmount,
    handleRecheckPayment,
    // User / address
    user,
    addresses,
    displayedAddresses,
    selectedAddress,
    showAllAddresses,
    setShowAllAddresses,
    addingNew,
    newAddress,
    handleSelectAddress,
    handleToggleAddNew,
    handleNewAddressChange,
    // Payment
    paymentMethod,
    setPaymentMethod,
    note,
    setNote,
    // Coupon
    coupon,
    setCoupon,
    couponApplied,
    handleApplyCoupon,
    // Actions
    handlePlaceOrder,
  };
}
