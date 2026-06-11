/**
 * useCheckout.js
 * Custom hook — toàn bộ state + logic checkout
 * Page chỉ đọc từ hook, không có business logic nào trực tiếp
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";
import {
  loadCheckoutUser,
  validateCoupon,
  calcShippingFee,
  placeOrder,
  EMPTY_NEW_ADDRESS,
} from "@/app/services/api/Checkoutpageservice";

export function useCheckout() {
  const router = useRouter();
  const {
    cartItems,
    cartTotal,
    cartCount,
    subscribeItems,
    subscribeTotal,
    subscribeCount,
    isMounted,
    clearCart,
  } = useCart();

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState("address");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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
  const hasSubscribes = subscribeItems.length > 0;
  const totalItemCount = cartCount + subscribeCount;
  const combinedSubtotal = cartTotal + subscribeTotal;
  const shippingFee = calcShippingFee(cartTotal, hasProducts);
  const finalTotal = combinedSubtotal - discount + shippingFee;

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
    if (isMounted && !loading && totalItemCount === 0 && !orderSuccess) {
      router.push("/");
    }
  }, [isMounted, loading, totalItemCount, orderSuccess, router]);

  // ─── Coupon ───────────────────────────────────────────────────────────────
  const handleApplyCoupon = useCallback(() => {
    const result = validateCoupon(coupon, combinedSubtotal);
    if (result.valid) {
      setDiscount(result.discount);
      setCouponApplied(true);
      toast.success(result.message);
    } else {
      setDiscount(0);
      setCouponApplied(false);
      toast.error(result.message);
    }
  }, [coupon, combinedSubtotal]);

  // ─── Place order ──────────────────────────────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress && !addingNew) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    if (addingNew) {
      const { fullName, phone, street, district, province } = newAddress;
      if (!fullName || !phone || !street || !district || !province) {
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
        return;
      }
    }

    setSubmitting(true);
    const deliveryAddress = selectedAddress ?? newAddress;

    const result = await placeOrder({
      cartItems,
      subscribeItems,
      deliveryAddress,
      paymentMethod,
      note,
      shippingFee,
      cartTotal,
      discount,
    });

    if (result.success) {
      clearCart();
      setOrderSuccess(true);
    } else {
      toast.error(result.error || "Đặt hàng thất bại, vui lòng thử lại");
    }

    setSubmitting(false);
  }, [
    selectedAddress,
    addingNew,
    newAddress,
    cartItems,
    subscribeItems,
    paymentMethod,
    note,
    shippingFee,
    cartTotal,
    discount,
    clearCart,
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
    subscribeItems,
    subscribeTotal,
    subscribeCount,
    hasProducts,
    hasSubscribes,
    totalItemCount,
    combinedSubtotal,
    shippingFee,
    finalTotal,
    discount,
    // UI
    step,
    setStep,
    loading,
    submitting,
    orderSuccess,
    isMounted,
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
