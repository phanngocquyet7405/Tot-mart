"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Truck,
  Tag,
  Loader2,
  ShieldCheck,
  Gift,
  CalendarDays,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { getTokenUserId } from "@/app/middleware/tokenMiddleware";
import { userService } from "@/app/services/api/userService";
import { checkoutService } from "@/app/services/api/checkoutService";
import { createPlanApi } from "@/app/services/api/subscribePlanService";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "address", label: "Địa chỉ", icon: MapPin },
  { id: "review", label: "Kiểm tra", icon: Package },
  { id: "payment", label: "Thanh toán", icon: CreditCard },
];

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    icon: "💵",
    desc: "COD - Trả tiền mặt khi nhận",
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    icon: "🏦",
    desc: "VietQR / Internet Banking",
  },
  { id: "momo", label: "Ví MoMo", icon: "📱", desc: "Thanh toán qua app MoMo" },
];

const fmt = (n) => (n ?? 0).toLocaleString("vi-VN");

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
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
    clearProductCart,
    clearSubscribeCart,
  } = useCart();

  const [step, setStep] = useState("address");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    ward: "",
    district: "",
    province: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // ── Tổng hợp 2 loại items ──────────────────────────────────────────────
  const hasProducts = cartItems.length > 0;
  const hasSubscribes = subscribeItems.length > 0;
  const totalItemCount = cartCount + subscribeCount; // để check giỏ trống

  const combinedSubtotal = cartTotal + subscribeTotal;

  // 🔍 DEBUG: log mỗi lần render để theo dõi state
  console.log("[Checkout] RENDER —", {
    isMounted,
    loading,
    cartCount,
    subscribeCount,
    totalItemCount,
    orderSuccess,
  });
  // Subscribe luôn free ship (giao theo kỳ), chỉ tính ship cho sản phẩm lẻ
  const shippingFee = hasProducts && cartTotal < 500000 ? 30000 : 0;
  const finalTotal = combinedSubtotal - discount + shippingFee;

  // ── Load user ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      console.log("[Checkout] loadUser fired");
      try {
        const userId = getTokenUserId();
        console.log("[Checkout] getTokenUserId() =", userId);

        if (!userId) {
          // 🔴 ĐÂY là nơi có thể redirect về login nếu token không đọc được
          console.error("[Checkout] ❌ userId null → redirect /login");
          toast.error("Vui lòng đăng nhập để thanh toán");
          router.push("/login"); // FIX: đổi từ "/" → "/login" cho đúng với lỗi mô tả
          return;
        }

        console.log("[Checkout] Fetching user profile for id:", userId);
        const res = await userService.getUserById(userId);
        console.log("[Checkout] userService response:", res);

        const data = res.data?.data ?? res.data;
        console.log("[Checkout] user data parsed:", data);

        setUser(data);
        const addrs = data?.addreses || [];
        console.log("[Checkout] addresses:", addrs.length, "địa chỉ");
        setAddresses(addrs);
        if (addrs.length > 0) setSelectedAddress(addrs[0]);
      } catch (err) {
        // 🔴 ĐÂY là nơi có thể gây lỗi im lặng nếu request thất bại
        console.error(
          "[Checkout] ❌ loadUser catch:",
          err?.response?.status,
          err?.response?.data || err?.message,
        );
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        console.log("[Checkout] loadUser finally → setLoading(false)");
        setLoading(false);
      }
    };
    loadUser();
  }, [router]);

  // ── Redirect nếu giỏ trống ─────────────────────────────────────────────
  // Phải đợi cả isMounted (CartContext đọc xong localStorage) VÀ
  // loading = false (user fetch xong) mới check — tránh redirect sớm
  useEffect(() => {
    console.log("[Checkout] Giỏ hàng effect check —", {
      isMounted,
      loading,
      totalItemCount,
      orderSuccess,
      willRedirect:
        isMounted && !loading && totalItemCount === 0 && !orderSuccess,
    });
    if (isMounted && !loading && totalItemCount === 0 && !orderSuccess) {
      console.warn("[Checkout] ⚠️ Giỏ trống → redirect /");
      router.push("/");
    }
  }, [isMounted, loading, totalItemCount, orderSuccess, router]);

  // ── Mã giảm giá (mock) ────────────────────────────────────────────────
  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === "TOTMART10") {
      setDiscount(Math.round(combinedSubtotal * 0.1));
      setCouponApplied(true);
      toast.success("Áp mã thành công! Giảm 10%");
    } else {
      toast.error("Mã giảm giá không hợp lệ");
      setDiscount(0);
      setCouponApplied(false);
    }
  };

  // ── Đặt hàng ──────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
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
    const userId = getTokenUserId();

    try {
      // ── 1. Đặt sản phẩm thường (nếu có) ──────────────────────────────
      if (hasProducts) {
        const productPayload = {
          items: cartItems.map((item) => ({
            productId: item._id || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          address: deliveryAddress,
          paymentMethod,
          note,
          shippingFee,
          totalPrice: cartTotal - discount + shippingFee,
        };
        const res = await checkoutService.createOrder(productPayload);
        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Đặt hàng sản phẩm thất bại");
          setSubmitting(false);
          return;
        }
      }

      // ── 2. Tạo từng gói subscribe (nếu có) ───────────────────────────
      if (hasSubscribes) {
        const subResults = await Promise.allSettled(
          subscribeItems.map((sub) =>
            createPlanApi({
              userId,
              boxId: sub.boxId,
              planType: sub.planType,
              totalDeliveries: sub.totalDeliveries,
              discountPercent: sub.discountPercent,
            }),
          ),
        );

        const failed = subResults.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          toast.error(`${failed.length} gói subscribe đặt không thành công`);
          // Vẫn tiếp tục clear và success nếu sản phẩm thường đã xong
        }
      }

      // ── 3. Thành công ─────────────────────────────────────────────────
      clearCart(); // xóa cả 2 loại
      setOrderSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || "Đặt hàng thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Màn hình thành công ───────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#0f0c09] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 size={48} className="text-amber-400" />
          </motion.div>
          <h1 className="text-3xl font-black text-[#f0dca4] mb-3 tracking-tight">
            Đặt hàng thành công!
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed mb-8">
            Cảm ơn bạn đã tin tưởng TotMart. Đơn hàng đang được xử lý và sẽ giao
            sớm nhất có thể.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/profile")}
              className="w-full bg-[#f0dca4] text-[#0f0c09] py-3.5 rounded-xl font-black uppercase tracking-widest text-[12px] hover:bg-amber-300 transition-colors"
            >
              Xem đơn hàng của tôi
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full border border-stone-700 text-stone-400 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:border-amber-400/50 hover:text-[#f0dca4] transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-[#0f0c09] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" size={32} />
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const displayedAddresses = showAllAddresses
    ? addresses
    : addresses.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0f0c09] text-white">
      {/* Gradient nền */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-amber-800/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:border-amber-400/60 hover:text-[#f0dca4] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#f0dca4] tracking-tight">
              Thanh toán
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {hasProducts && `${cartCount} sản phẩm`}
              {hasProducts && hasSubscribes && " · "}
              {hasSubscribes && `${subscribeCount} gói subscribe`}
            </p>
          </div>
        </div>

        {/* ── Stepper ── */}
        <div className="flex items-center mb-10 max-w-sm">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = i < stepIndex;
            return (
              <div
                key={s.id}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => isDone && setStep(s.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border font-black transition-all
                      ${isActive ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-900/40" : ""}
                      ${isDone ? "bg-amber-900/40 border-amber-600/50 text-amber-400 cursor-pointer hover:border-amber-400" : ""}
                      ${!isActive && !isDone ? "bg-stone-900 border-stone-700 text-stone-600" : ""}
                    `}
                  >
                    {isDone ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                  </button>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider
                    ${isActive ? "text-amber-400" : isDone ? "text-stone-500" : "text-stone-700"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 mb-4 ${isDone ? "bg-amber-600/50" : "bg-stone-800"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Layout 2 cột ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* ── Cột trái ── */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {/* BƯỚC 1: ĐỊA CHỈ */}
              {step === "address" && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="space-y-4"
                >
                  <SectionCard
                    title="Địa chỉ giao hàng"
                    icon={<MapPin size={16} />}
                  >
                    {addresses.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {displayedAddresses.map((addr, i) => (
                          <label
                            key={addr._id || i}
                            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all
                              ${
                                selectedAddress === addr
                                  ? "border-amber-500/60 bg-amber-900/15"
                                  : "border-stone-800 bg-stone-900/60 hover:border-stone-600"
                              }`}
                          >
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddress === addr}
                              onChange={() => {
                                setSelectedAddress(addr);
                                setAddingNew(false);
                              }}
                              className="mt-0.5 accent-amber-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">
                                {addr.fullName || addr.name || user?.name}
                              </p>
                              <p className="text-xs text-stone-400 mt-0.5">
                                {addr.phone || ""}
                              </p>
                              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                {[
                                  addr.street,
                                  addr.ward,
                                  addr.district,
                                  addr.province,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            </div>
                          </label>
                        ))}
                        {addresses.length > 2 && (
                          <button
                            onClick={() =>
                              setShowAllAddresses(!showAllAddresses)
                            }
                            className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 font-bold"
                          >
                            {showAllAddresses ? (
                              <>
                                <ChevronUp size={14} /> Thu gọn
                              </>
                            ) : (
                              <>
                                <ChevronDown size={14} /> Xem thêm{" "}
                                {addresses.length - 2} địa chỉ
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setAddingNew(!addingNew);
                        setSelectedAddress(null);
                      }}
                      className={`text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all
                        ${
                          addingNew
                            ? "border-amber-500/60 text-amber-400 bg-amber-900/15"
                            : "border-stone-700 text-stone-400 hover:border-amber-500/40 hover:text-amber-400"
                        }`}
                    >
                      + Thêm địa chỉ mới
                    </button>

                    <AnimatePresence>
                      {addingNew && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-stone-800">
                            {[
                              { key: "fullName", label: "Họ tên người nhận" },
                              { key: "phone", label: "Số điện thoại" },
                              {
                                key: "street",
                                label: "Số nhà, tên đường",
                                full: true,
                              },
                              { key: "ward", label: "Phường/Xã" },
                              { key: "district", label: "Quận/Huyện" },
                              { key: "province", label: "Tỉnh/Thành phố" },
                            ].map(({ key, label, full }) => (
                              <div
                                key={key}
                                className={full ? "sm:col-span-2" : ""}
                              >
                                <label className="text-[10px] text-stone-500 uppercase tracking-widest font-bold block mb-1.5">
                                  {label}
                                </label>
                                <input
                                  value={newAddress[key]}
                                  onChange={(e) =>
                                    setNewAddress((p) => ({
                                      ...p,
                                      [key]: e.target.value,
                                    }))
                                  }
                                  placeholder={label}
                                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 transition-colors"
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SectionCard>

                  <SectionCard
                    title="Ghi chú đơn hàng"
                    icon={<Tag size={16} />}
                  >
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Ghi chú cho người giao hàng (không bắt buộc)..."
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
                    />
                  </SectionCard>

                  <button
                    onClick={() => setStep("review")}
                    disabled={!selectedAddress && !addingNew}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all active:scale-[0.98] disabled:cursor-not-allowed"
                  >
                    Tiếp theo → Kiểm tra đơn
                  </button>
                </motion.div>
              )}

              {/* BƯỚC 2: KIỂM TRA */}
              {step === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="space-y-4"
                >
                  {/* Sản phẩm thường */}
                  {hasProducts && (
                    <SectionCard
                      title={`Sản phẩm (${cartCount})`}
                      icon={<Package size={16} />}
                    >
                      <div className="space-y-3">
                        {cartItems.map((item, i) => (
                          <div
                            key={item._id || item.id || i}
                            className="flex gap-3 items-center"
                          >
                            <div className="w-14 h-14 rounded-lg bg-stone-800 overflow-hidden shrink-0 border border-stone-700 relative">
                              {item.image && (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-contain p-1"
                                  sizes="56px"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-xs text-stone-500 mt-0.5">
                                x{item.quantity} · {fmt(item.price)}₫/sp
                              </p>
                            </div>
                            <p className="text-sm font-black text-amber-400 shrink-0">
                              {fmt(item.price * item.quantity)}₫
                            </p>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* Gói Subscribe */}
                  {hasSubscribes && (
                    <SectionCard
                      title={`Gói Subscribe (${subscribeCount})`}
                      icon={<RefreshCcw size={16} />}
                    >
                      <div className="space-y-3">
                        {subscribeItems.map((sub) => (
                          <div
                            key={sub.key}
                            className="flex gap-3 items-center"
                          >
                            <div className="w-14 h-14 rounded-lg bg-stone-800 overflow-hidden shrink-0 border border-stone-700 relative">
                              {sub.boxImage && (
                                <Image
                                  src={sub.boxImage}
                                  alt={sub.boxName}
                                  fill
                                  className="object-contain p-1"
                                  sizes="56px"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white line-clamp-1">
                                {sub.boxName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <CalendarDays
                                  size={11}
                                  className="text-amber-500"
                                />
                                <p className="text-xs text-stone-500">
                                  {sub.planLabel} · {sub.totalDeliveries} lần
                                  giao
                                </p>
                              </div>
                              {sub.discountPercent > 0 && (
                                <p className="text-[10px] text-green-400 mt-0.5">
                                  Tiết kiệm {fmt(sub.save)}₫
                                </p>
                              )}
                            </div>
                            <p className="text-sm font-black text-amber-400 shrink-0">
                              {fmt(sub.totalPrice)}₫
                            </p>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* Địa chỉ đã chọn */}
                  <SectionCard
                    title="Địa chỉ giao hàng"
                    icon={<MapPin size={16} />}
                  >
                    {(() => {
                      const addr = selectedAddress ?? newAddress;
                      return (
                        <div>
                          <p className="text-sm font-bold text-white">
                            {addr.fullName || user?.name}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {addr.phone}
                          </p>
                          <p className="text-xs text-stone-500 mt-1">
                            {[
                              addr.street,
                              addr.ward,
                              addr.district,
                              addr.province,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <button
                            onClick={() => setStep("address")}
                            className="text-xs text-amber-500 hover:text-amber-400 font-bold mt-2"
                          >
                            Thay đổi
                          </button>
                        </div>
                      );
                    })()}
                  </SectionCard>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("address")}
                      className="flex-1 border border-stone-700 text-stone-400 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:border-stone-500 transition-colors"
                    >
                      ← Quay lại
                    </button>
                    <button
                      onClick={() => setStep("payment")}
                      className="flex-2 bg-amber-600 hover:bg-amber-500 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all active:scale-[0.98]"
                    >
                      Tiếp theo → Thanh toán
                    </button>
                  </div>
                </motion.div>
              )}

              {/* BƯỚC 3: THANH TOÁN */}
              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="space-y-4"
                >
                  <SectionCard
                    title="Phương thức thanh toán"
                    icon={<CreditCard size={16} />}
                  >
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((pm) => (
                        <label
                          key={pm.id}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                            ${paymentMethod === pm.id ? "border-amber-500/60 bg-amber-900/15" : "border-stone-800 hover:border-stone-600"}`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={pm.id}
                            checked={paymentMethod === pm.id}
                            onChange={() => setPaymentMethod(pm.id)}
                            className="accent-amber-500"
                          />
                          <span className="text-xl">{pm.icon}</span>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {pm.label}
                            </p>
                            <p className="text-xs text-stone-500">{pm.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Mã giảm giá" icon={<Gift size={16} />}>
                    <div className="flex gap-2">
                      <input
                        value={coupon}
                        onChange={(e) =>
                          setCoupon(e.target.value.toUpperCase())
                        }
                        placeholder="Nhập mã (thử: TOTMART10)"
                        className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500/60 transition-colors uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!coupon.trim() || couponApplied}
                        className="px-4 py-2.5 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors"
                      >
                        {couponApplied ? "✓ Áp dụng" : "Áp dụng"}
                      </button>
                    </div>
                    {couponApplied && (
                      <p className="text-xs text-amber-400 mt-2 font-bold">
                        ✓ Đã giảm {fmt(discount)}₫
                      </p>
                    )}
                  </SectionCard>

                  <div className="flex items-center gap-2 text-stone-600 px-1">
                    <ShieldCheck size={14} />
                    <p className="text-xs">
                      Thông tin thanh toán được mã hóa và bảo mật tuyệt đối.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("review")}
                      className="flex-1 border border-stone-700 text-stone-400 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:border-stone-500 transition-colors"
                    >
                      ← Quay lại
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={submitting}
                      className="flex-2 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Đang xử
                          lý...
                        </>
                      ) : (
                        <>Đặt hàng · {fmt(finalTotal)}₫</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Cột phải: Tóm tắt ── */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <SectionCard title="Tóm tắt đơn hàng" icon={<Package size={16} />}>
              {/* Sản phẩm thường */}
              {hasProducts && (
                <div className="space-y-2 pb-3 border-b border-stone-800">
                  <p className="text-[10px] text-stone-600 uppercase tracking-widest font-bold mb-2">
                    Sản phẩm
                  </p>
                  {cartItems.slice(0, 3).map((item, i) => (
                    <div
                      key={item._id || i}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs text-stone-400 line-clamp-1 flex-1 mr-2">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-xs font-bold text-white shrink-0">
                        {fmt(item.price * item.quantity)}₫
                      </span>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-xs text-stone-600">
                      +{cartItems.length - 3} sản phẩm khác
                    </p>
                  )}
                </div>
              )}

              {/* Gói subscribe */}
              {hasSubscribes && (
                <div className="space-y-2 py-3 border-b border-stone-800">
                  <p className="text-[10px] text-stone-600 uppercase tracking-widest font-bold mb-2">
                    Subscribe
                  </p>
                  {subscribeItems.map((sub) => (
                    <div
                      key={sub.key}
                      className="flex justify-between items-center"
                    >
                      <div className="flex-1 mr-2 min-w-0">
                        <span className="text-xs text-stone-400 line-clamp-1">
                          {sub.boxName}
                        </span>
                        <span className="text-[10px] text-stone-600 block">
                          {sub.planLabel}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white shrink-0">
                        {fmt(sub.totalPrice)}₫
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Chi phí */}
              <div className="space-y-2 pt-3">
                {hasProducts && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-400">Sản phẩm</span>
                    <span className="text-white font-bold">
                      {fmt(cartTotal)}₫
                    </span>
                  </div>
                )}
                {hasSubscribes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-400">Subscribe</span>
                    <span className="text-white font-bold">
                      {fmt(subscribeTotal)}₫
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-500">Giảm giá</span>
                    <span className="text-green-400 font-bold">
                      -{fmt(discount)}₫
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 flex items-center gap-1">
                    <Truck size={12} /> Vận chuyển
                  </span>
                  <span
                    className={
                      shippingFee === 0
                        ? "text-green-400 font-bold"
                        : "text-white font-bold"
                    }
                  >
                    {shippingFee === 0 ? "Miễn phí" : `${fmt(shippingFee)}₫`}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-[10px] text-stone-600">
                    Miễn phí ship cho đơn sản phẩm từ 500.000₫
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-stone-800 mt-2">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  Tổng cộng
                </span>
                <span className="text-xl font-black text-amber-400">
                  {fmt(finalTotal)}₫
                </span>
              </div>
            </SectionCard>

            <div className="space-y-2 px-1">
              {[
                { icon: "🚚", text: "Giao hàng trong 2-5 ngày" },
                { icon: "🔄", text: "Đổi trả miễn phí trong 7 ngày" },
                { icon: "🎁", text: "Đóng gói quà tặng miễn phí" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-stone-500"
                >
                  <span className="text-base">{icon}</span>
                  <span className="text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-amber-500">{icon}</span>
        <h2 className="text-sm font-black text-[#f0dca4] uppercase tracking-widest">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
//after tach cac
