"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  X,
  Gift,
  Truck,
  RotateCcw,
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Lock,
  Package,
  Star,
  MapPin,
  Phone,
  Home,
  Building2,
  Globe,
  Hash,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// API Services
import { subscriptionApi } from "@/app/services/api/subscribePlanService";
import { checkTokenValid } from "@/app/middleware/tokenMiddleware";
import { userService } from "@/app/services/api/userService";

// Utils
import { formatCurrency } from "@/app/util/formatter";
import logger from "@/app/util/Logger";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80";

const PLAN_MONTHS = {
  "1_month": 1,
  "3_month": 3,
  "6_month": 6,
  "12_month": 12,
};

const PLAN_META = {
  "1_month": { label: "1 Tháng", tag: null },
  "3_month": { label: "3 Tháng", tag: "TIẾT KIỆM" },
  "6_month": { label: "6 Tháng", tag: "POPULAR" },
  "12_month": { label: "12 Tháng", tag: "BEST VALUE" },
};

const ALL_PLAN_TYPES = ["12_month", "6_month", "3_month", "1_month"];

const EMPTY_ADDRESS = {
  address: "",
  district: "",
  city: "",
  country: "Vietnam",
  zipCode: "",
  phone: "",
};

/** Logic Mapping dữ liệu API vào giao diện */
function buildDisplayPlans(apiPlans, fallbackBasePrice = 0) {
  const apiMap = {};
  apiPlans.forEach((p) => {
    if (p.planType) apiMap[p.planType] = p;
  });

  const baseMonthlyPrice =
    apiMap["1_month"]?.basePrice || apiPlans[0]?.basePrice || fallbackBasePrice;

  return ALL_PLAN_TYPES.map((type) => {
    const months = PLAN_MONTHS[type];
    const meta = PLAN_META[type];

    if (apiMap[type]) {
      const p = apiMap[type];
      const pricePerMonth = p.discountPrice ?? p.basePrice;
      const totalPrice = pricePerMonth * months;
      const totalOriginal = baseMonthlyPrice * months;
      const savings = totalOriginal - totalPrice;
      const saveText =
        savings > 0 ? `TIẾT KIỆM ${formatCurrency(savings)}` : null;

      return {
        ...p,
        _displayType: type,
        _label: meta.label,
        _tag: meta.tag,
        _isReal: true,
        _months: months,
        _pricePerMonth: pricePerMonth,
        _totalPrice: totalPrice,
        _saveText: saveText,
      };
    }

    return {
      _id: `frontend_${type}`,
      planType: type,
      basePrice: baseMonthlyPrice,
      discountPercent: 0,
      discountPrice: baseMonthlyPrice,
      gift: [],
      isActive: false,
      _displayType: type,
      _label: meta.label,
      _tag: meta.tag,
      _isReal: false,
      _months: months,
      _pricePerMonth: baseMonthlyPrice,
      _totalPrice: baseMonthlyPrice * months,
      _saveText: null,
    };
  });
}

// ─── Address Field Component ────────────────────────────────────────────────
function AddressField({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#A08880] flex items-center gap-1.5">
        <Icon size={10} className="text-[#C85C3C]" />
        {label}
        {required && <span className="text-[#C85C3C]">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0DDD5] bg-[#FFFAF8] text-[#2C1810] text-xs placeholder:text-stone-300 focus:outline-none focus:border-[#C85C3C] focus:ring-2 focus:ring-[#C85C3C]/10 transition-all"
      />
    </div>
  );
}

// ─── Saved Address Card ─────────────────────────────────────────────────────
function SavedAddressCard({ addr, selected, onSelect, index }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(addr)}
      className={cn(
        "w-full text-left rounded-xl border-2 p-3.5 transition-all duration-200 relative group",
        selected
          ? "border-[#C85C3C] bg-[#FFF5F2] shadow-sm"
          : "border-[#F0DDD5] bg-[#FFFAF8] hover:border-[#C85C3C]/40 hover:bg-[#FFF9F7]",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Radio dot */}
        <div
          className={cn(
            "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
            selected
              ? "border-[#C85C3C] bg-[#C85C3C]"
              : "border-stone-300 bg-white",
          )}
        >
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A08880]">
              Địa chỉ {index + 1}
            </span>
            {selected && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#C85C3C] text-white uppercase tracking-wide">
                Đang chọn
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-[#2C1810] truncate">
            {addr.address}
          </p>
          <p className="text-[11px] text-[#7A645D] mt-0.5">
            {[addr.district, addr.city, addr.country]
              .filter(Boolean)
              .join(", ")}
          </p>
          {addr.phone && (
            <p className="text-[11px] text-[#A08880] mt-0.5 flex items-center gap-1">
              <Phone size={9} /> {addr.phone}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {/* Step 1 */}
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
            step === 1
              ? "bg-[#C85C3C] text-white shadow-sm shadow-[#C85C3C]/30"
              : "bg-[#C85C3C]/10 text-[#C85C3C]",
          )}
        >
          {step > 1 ? <CheckCircle2 size={13} /> : "1"}
        </div>
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest hidden sm:block",
            step === 1 ? "text-[#C85C3C]" : "text-[#A08880]",
          )}
        >
          Chọn gói
        </span>
      </div>

      {/* Divider */}
      <div
        className={cn(
          "flex-1 h-px transition-colors",
          step > 1 ? "bg-[#C85C3C]/40" : "bg-[#F0DDD5]",
        )}
      />

      {/* Step 2 */}
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
            step === 2
              ? "bg-[#C85C3C] text-white shadow-sm shadow-[#C85C3C]/30"
              : "bg-[#F0DDD5] text-stone-400",
          )}
        >
          2
        </div>
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest hidden sm:block",
            step === 2 ? "text-[#C85C3C]" : "text-stone-400",
          )}
        >
          Địa chỉ nhận hàng
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ChoosePlanModal({ box, onClose, plansProps = [] }) {
  const router = useRouter();

  // ── Plan state ──
  const [displayPlans, setDisplayPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // ── User / address state ──
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState(null); // index or null
  const [useManual, setUseManual] = useState(false);
  const [manualAddress, setManualAddress] = useState({ ...EMPTY_ADDRESS });
  const [addressErrors, setAddressErrors] = useState({});

  // ── Step / submit ──
  const [step, setStep] = useState(1); // 1 = choose plan, 2 = address
  const [submitting, setSubmitting] = useState(false);

  const galleryImages =
    box?.images?.length > 0 ? box.images : [{ url: box?.image || PLACEHOLDER }];

  // ── Fetch plans & user ──
  useEffect(() => {
    const prepare = (apiPlans) => {
      const built = buildDisplayPlans(apiPlans, box?.value ?? 0);
      setDisplayPlans(built);
      const def =
        built.find((p) => p._displayType === "12_month" && p._isReal) ||
        built.find((p) => p._isReal) ||
        built[0];
      setSelectedPlan(def);
    };

    if (plansProps.length > 0) {
      prepare(plansProps);
    } else {
      const fetchPlans = async () => {
        if (!box?._id) return;
        try {
          setLoadingPlans(true);
          const res = await subscriptionApi.getActive();
          const raw = res?.data ?? res;
          const allPlans = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
          const filtered = allPlans.filter(
            (p) => (p.boxId?._id ?? p.boxId) === box._id,
          );
          prepare(filtered);
        } catch (err) {
          logger.error("[ChoosePlanModal] Lỗi lấy plans:", err);
          prepare([]);
        } finally {
          setLoadingPlans(false);
        }
      };
      fetchPlans();
    }

    const fetchUserData = async () => {
      if (!checkTokenValid()) {
        setLoadingUser(false);
        return;
      }
      try {
        setLoadingUser(true);
        const res = await userService.getMe();
        const fetched = res.data?.data || res.data;
        setUserData(fetched);
        const addrs = fetched?.addreses || fetched?.addresses || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedSavedAddr(0);
        } else {
          setUseManual(true);
        }
      } catch (err) {
        logger.error("[ChoosePlanModal] Lỗi lấy user:", err);
        setUseManual(true);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserData();
  }, [box, plansProps]);

  // ── Address helpers ──
  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualAddress((prev) => ({ ...prev, [name]: value }));
    if (addressErrors[name]) {
      setAddressErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const selectSaved = (addr, idx) => {
    setSelectedSavedAddr(idx);
    setUseManual(false);
  };

  const switchToManual = () => {
    setSelectedSavedAddr(null);
    setUseManual(true);
  };

  const validateAddress = (addr) => {
    const errors = {};
    if (!addr.address?.trim()) errors.address = true;
    if (!addr.district?.trim()) errors.district = true;
    if (!addr.city?.trim()) errors.city = true;
    if (!addr.phone?.trim()) errors.phone = true;
    return errors;
  };

  const getResolvedAddress = () => {
    if (useManual) return manualAddress;
    if (selectedSavedAddr !== null && savedAddresses[selectedSavedAddr]) {
      const a = savedAddresses[selectedSavedAddr];
      return {
        address: a.address || "",
        district: a.district || "",
        city: a.city || "",
        country: a.country || "Vietnam",
        zipCode: a.zipCode || "",
        phone: a.phone || "",
      };
    }
    return null;
  };

  // ── Step navigation ──
  const handleNextStep = () => {
    if (!checkTokenValid()) {
      toast.error("Vui lòng đăng nhập để đăng ký gói!");
      router.push("/login");
      return;
    }
    if (!selectedPlan || !selectedPlan._isReal) {
      toast.error("Gói này chưa khả dụng!");
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  // ── Submit ──
  const handleSubscribe = async () => {
    const resolved = getResolvedAddress();
    if (!resolved) {
      toast.error("Vui lòng chọn hoặc nhập địa chỉ giao hàng!");
      return;
    }

    if (useManual) {
      const errors = validateAddress(manualAddress);
      if (Object.keys(errors).length > 0) {
        setAddressErrors(errors);
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ!");
        return;
      }
    }

    const shippingAddress = {
      address: resolved.address,
      district: resolved.district,
      city: resolved.city,
      country: resolved.country || "Vietnam",
      phone: resolved.phone,
      zipCode: resolved.zipCode || "",
    };

    logger.log("[ChoosePlanModal] Subscribing:", {
      templateId: selectedPlan._id,
      shippingAddress,
    });

    try {
      setSubmitting(true);
      const res = await subscriptionApi.subscribe({
        templateId: selectedPlan._id,
        shippingAddress,
      });

      if (res) {
        toast.success("Đăng ký thành viên thành công!");
        onClose();
        router.push("/my-subscriptions");
      }
    } catch (err) {
      logger.error("[ChoosePlanModal] Lỗi subscribe:", err);
      toast.error(
        err?.response?.data?.message ||
          "Đăng ký thất bại, vui lòng thử lại sau.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!box) return null;

  const giftItems = Array.isArray(selectedPlan?.gift)
    ? selectedPlan.gift.filter((g) => g?.boxId?.name)
    : [];

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#FFFAF8] rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-[#F0DDD5] animate-in fade-in zoom-in-95 duration-300 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/95 border border-[#F0DDD5] hover:bg-white text-stone-500 hover:text-stone-800 transition-all shadow-md active:scale-95"
        >
          <X size={16} />
        </button>

        {/* ═══════════════════════════════════════
            CỘT TRÁI — GALLERY & CHI TIẾT
        ═══════════════════════════════════════ */}
        <div className="w-full lg:w-5/12 p-6 lg:p-8 bg-[#FFF5F2] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#F0DDD5] overflow-y-auto">
          <div className="space-y-5">
            {/* Gallery */}
            <div className="flex gap-3">
              {galleryImages.length > 1 && (
                <div className="flex flex-col gap-2 shrink-0">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={cn(
                        "w-14 h-14 rounded-lg overflow-hidden border-2 transition-all relative",
                        activeImageIdx === idx
                          ? "border-[#C85C3C] ring-2 ring-[#C85C3C]/20 scale-105"
                          : "border-[#F0DDD5] hover:border-[#C85C3C]/50",
                      )}
                    >
                      <Image
                        src={img.url || PLACEHOLDER}
                        alt={`thumb-${idx}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 aspect-4/3 rounded-2xl overflow-hidden bg-white border border-[#F0DDD5] relative shadow-inner">
                <Image
                  src={galleryImages[activeImageIdx]?.url || PLACEHOLDER}
                  alt="Main"
                  fill
                  className="object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[#F0DDD5] flex items-center gap-1.5 shadow-sm">
                  <span className="text-[10px] font-black text-[#2C1810]">
                    5.0
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={9} fill="#C85C3C" color="#C85C3C" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Box info + selected plan summary */}
            <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-5 border border-[#F0DDD5] space-y-4 shadow-xs">
              <h4 className="font-serif text-[13px] font-bold text-[#2C1810] border-b border-[#F5E6E0] pb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-[#C85C3C] animate-pulse" />
                Khám Phá Hương Vị Việt
              </h4>
              <ul className="space-y-2.5 text-xs text-[#5A4540]">
                {[
                  "20+ Bánh kẹo & Trà đặc sản",
                  "Cẩm nang Văn hóa 24 trang",
                  "Ủng hộ gia đình nghệ nhân bản địa",
                  "Thay đổi chủ đề hàng tháng",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C85C3C] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selected plan summary — hiển thị khi qua step 2 */}
            {step === 2 && selectedPlan && (
              <div className="bg-[#C85C3C]/5 rounded-2xl p-4 border border-[#C85C3C]/15 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#A08880]">
                  Gói đã chọn
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-base font-black text-[#2C1810]">
                    {selectedPlan._months} Tháng
                    {selectedPlan._tag && (
                      <span className="ml-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#C85C3C] text-white uppercase">
                        {selectedPlan._tag}
                      </span>
                    )}
                  </span>
                  <span className="font-serif text-lg font-black text-[#C85C3C]">
                    {formatCurrency(Math.round(selectedPlan._totalPrice))}
                  </span>
                </div>
                {selectedPlan._saveText && (
                  <p className="text-[10px] font-bold text-[#C85C3C] bg-red-50 px-2 py-1 rounded-lg inline-block">
                    {selectedPlan._saveText}
                  </p>
                )}
                <button
                  onClick={handleBack}
                  className="text-[10px] text-[#A08880] hover:text-[#C85C3C] underline underline-offset-2 transition-colors mt-1 flex items-center gap-1"
                >
                  <ChevronLeft size={10} /> Thay đổi gói
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-[#F0DDD5] pt-4 mt-6 text-[10px] text-[#7A645D] gap-y-2">
            <div className="flex items-center gap-1.5">
              <Truck size={13} className="text-[#C85C3C]" /> Giao hàng miễn phí
              toàn quốc
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw size={12} className="text-[#C85C3C]" /> Hủy gia hạn bất
              kỳ lúc nào
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            CỘT PHẢI — STEP CONTENT
        ═══════════════════════════════════════ */}
        <div className="w-full lg:w-7/12 p-6 lg:p-10 flex flex-col justify-between bg-white overflow-y-auto">
          <div>
            {/* Header */}
            <div className="mb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C85C3C]">
                {step === 1 ? "CHOOSE YOUR PLAN" : "SHIPPING ADDRESS"}
              </span>
              <h2 className="font-serif text-2xl lg:text-3xl font-black text-[#2C1810] mt-1.5 leading-tight">
                {step === 1 ? `Gift ${box.name}` : "Địa Chỉ Nhận Hàng"}
              </h2>
              {userData && (
                <p className="text-xs text-stone-500 mt-1">
                  Tài khoản:{" "}
                  <span className="font-medium text-[#C85C3C]">
                    {userData.name || userData.email}
                  </span>
                </p>
              )}
            </div>

            {/* Step indicator */}
            <StepIndicator step={step} />

            {/* ─── STEP 1: PLAN SELECTION ─── */}
            {step === 1 && (
              <>
                <div className="bg-[#C85C3C] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mb-5 shadow-sm">
                  <Gift size={14} className="animate-bounce" /> Nhận thêm quà
                  tặng đặc biệt khi chọn gói dài hạn!
                </div>

                {loadingPlans ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C85C3C]" />
                    <p className="text-xs text-stone-400 mt-2">
                      Đang thiết lập chu kỳ...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayPlans.map((plan) => {
                      const isSelected =
                        selectedPlan?._displayType === plan._displayType;
                      return (
                        <button
                          key={plan._displayType}
                          onClick={() => setSelectedPlan(plan)}
                          disabled={!plan._isReal}
                          className={cn(
                            "w-full text-left rounded-2xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col group",
                            isSelected
                              ? "border-[#C85C3C] bg-[#C85C3C] text-white shadow-md scale-[1.01]"
                              : "border-[#F0DDD5] hover:border-[#C85C3C]/40 bg-[#FFFAF8]",
                            !plan._isReal &&
                              "opacity-50 cursor-not-allowed bg-stone-50",
                          )}
                        >
                          <div className="p-4 flex items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                  isSelected
                                    ? "border-white bg-white text-[#C85C3C]"
                                    : "border-[#C85C3C]/50 bg-white",
                                )}
                              >
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#C85C3C]" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "font-serif text-base lg:text-lg font-black",
                                    isSelected
                                      ? "text-white"
                                      : "text-[#2C1810]",
                                  )}
                                >
                                  {plan._months} Tháng
                                </span>
                                {plan._tag && (
                                  <span
                                    className={cn(
                                      "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider",
                                      isSelected
                                        ? "bg-white text-[#C85C3C]"
                                        : "bg-[#C85C3C] text-white",
                                    )}
                                  >
                                    {plan._tag}
                                  </span>
                                )}
                                {!plan._isReal && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 flex items-center gap-0.5">
                                    <Lock size={8} /> SẮP CÓ
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1 sm:gap-2.5">
                                {plan._saveText && (
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold px-2 py-0.5 rounded-md",
                                      isSelected
                                        ? "bg-[#FFF0EB] text-[#C85C3C]"
                                        : "bg-red-50 text-[#C85C3C] border border-red-100",
                                    )}
                                  >
                                    {plan._saveText}
                                  </span>
                                )}
                                <div className="flex items-baseline">
                                  <span
                                    className={cn(
                                      "font-serif text-lg font-black",
                                      isSelected
                                        ? "text-white"
                                        : "text-[#C85C3C]",
                                    )}
                                  >
                                    {formatCurrency(
                                      Math.round(plan._pricePerMonth),
                                    )}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[10px] ml-0.5",
                                      isSelected
                                        ? "text-white/80"
                                        : "text-stone-400",
                                    )}
                                  >
                                    /tháng
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {isSelected && giftItems.length > 0 && (
                            <div className="mx-4 mb-4 p-3 rounded-xl bg-white/10 border border-white/10 text-white flex gap-2.5 items-start animate-in slide-in-from-top-2 duration-300">
                              <div className="p-1.5 rounded-md bg-white/20 shrink-0">
                                <Gift size={14} className="text-white" />
                              </div>
                              <div className="text-xs space-y-1">
                                <span className="font-black text-[#FFFAF8] block text-[9px] uppercase tracking-wider">
                                  Quà tặng kèm độc quyền:
                                </span>
                                {giftItems.map((g, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-1.5 font-bold"
                                  >
                                    <Package
                                      size={10}
                                      className="text-[#f0dca4] shrink-0"
                                    />
                                    <span className="text-[#f0dca4]">
                                      {g.boxId.name}
                                    </span>
                                    {g.quantity > 1 && (
                                      <span className="opacity-80">
                                        ×{g.quantity}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ─── STEP 2: ADDRESS ─── */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Saved addresses */}
                {!loadingUser && savedAddresses.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A08880] mb-2.5 flex items-center gap-1.5">
                      <MapPin size={10} className="text-[#C85C3C]" />
                      Địa chỉ đã lưu
                    </p>
                    <div className="space-y-2.5">
                      {savedAddresses.map((addr, idx) => (
                        <SavedAddressCard
                          key={idx}
                          addr={addr}
                          index={idx}
                          selected={!useManual && selectedSavedAddr === idx}
                          onSelect={() => selectSaved(addr, idx)}
                        />
                      ))}
                    </div>

                    {/* Toggle manual */}
                    {!useManual ? (
                      <button
                        type="button"
                        onClick={switchToManual}
                        className="mt-3 text-[10px] font-bold text-[#A08880] hover:text-[#C85C3C] flex items-center gap-1.5 transition-colors"
                      >
                        <Plus size={11} /> Dùng địa chỉ khác
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setUseManual(false);
                          setSelectedSavedAddr(0);
                        }}
                        className="mt-3 text-[10px] font-bold text-[#A08880] hover:text-[#C85C3C] flex items-center gap-1.5 transition-colors"
                      >
                        <ChevronLeft size={11} /> Dùng địa chỉ đã lưu
                      </button>
                    )}
                  </div>
                )}

                {/* Loading user */}
                {loadingUser && (
                  <div className="flex items-center gap-2 py-4 text-stone-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-xs">Đang tải địa chỉ...</span>
                  </div>
                )}

                {/* Manual address form */}
                {(useManual || savedAddresses.length === 0) && !loadingUser && (
                  <div
                    className={cn(
                      "rounded-2xl border-2 p-5 space-y-4 transition-all duration-200",
                      savedAddresses.length > 0
                        ? "border-[#C85C3C]/20 bg-[#FFF9F7]"
                        : "border-[#F0DDD5] bg-[#FFFAF8]",
                    )}
                  >
                    {savedAddresses.length > 0 && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#C85C3C] flex items-center gap-1.5">
                        <Plus size={10} /> Địa chỉ mới
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Địa chỉ cụ thể — full width */}
                      <div className="sm:col-span-2">
                        <AddressField
                          icon={Home}
                          label="Địa chỉ cụ thể"
                          name="address"
                          value={manualAddress.address}
                          onChange={handleManualChange}
                          placeholder="Số nhà, tên đường, thôn/xóm..."
                          required
                        />
                        {addressErrors.address && (
                          <p className="text-[10px] text-red-500 mt-1">
                            Vui lòng nhập địa chỉ
                          </p>
                        )}
                      </div>

                      {/* Quận/Huyện */}
                      <div>
                        <AddressField
                          icon={Building2}
                          label="Quận / Huyện"
                          name="district"
                          value={manualAddress.district}
                          onChange={handleManualChange}
                          placeholder="VD: Hoàn Kiếm"
                          required
                        />
                        {addressErrors.district && (
                          <p className="text-[10px] text-red-500 mt-1">
                            Vui lòng nhập quận/huyện
                          </p>
                        )}
                      </div>

                      {/* Tỉnh/Thành phố */}
                      <div>
                        <AddressField
                          icon={MapPin}
                          label="Tỉnh / Thành phố"
                          name="city"
                          value={manualAddress.city}
                          onChange={handleManualChange}
                          placeholder="VD: Hà Nội"
                          required
                        />
                        {addressErrors.city && (
                          <p className="text-[10px] text-red-500 mt-1">
                            Vui lòng nhập tỉnh/thành phố
                          </p>
                        )}
                      </div>

                      {/* Quốc gia */}
                      <div>
                        <AddressField
                          icon={Globe}
                          label="Quốc gia"
                          name="country"
                          value={manualAddress.country}
                          onChange={handleManualChange}
                          placeholder="Vietnam"
                        />
                      </div>

                      {/* Mã bưu điện */}
                      <div>
                        <AddressField
                          icon={Hash}
                          label="Mã bưu điện"
                          name="zipCode"
                          value={manualAddress.zipCode}
                          onChange={handleManualChange}
                          placeholder="VD: 100000"
                        />
                      </div>

                      {/* Số điện thoại — full width */}
                      <div className="sm:col-span-2">
                        <AddressField
                          icon={Phone}
                          label="Số điện thoại"
                          name="phone"
                          value={manualAddress.phone}
                          onChange={handleManualChange}
                          placeholder="VD: 0912 345 678"
                          required
                          type="tel"
                        />
                        {addressErrors.phone && (
                          <p className="text-[10px] text-red-500 mt-1">
                            Vui lòng nhập số điện thoại
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── FOOTER ─── */}
          <div className="mt-8 border-t border-[#F0DDD5] pt-6">
            {step === 1 ? (
              /* Step 1 footer */
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A08880]">
                    TỔNG CỦA BẠN
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-black text-[#C85C3C]">
                      {formatCurrency(
                        selectedPlan ? Math.round(selectedPlan._totalPrice) : 0,
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A08880]">
                    {selectedPlan?._months === 1
                      ? "Tự động gia hạn hàng tháng"
                      : `Thanh toán một lần cho toàn chu kỳ ${selectedPlan?._months} tháng`}
                  </p>
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={!selectedPlan || !selectedPlan._isReal}
                  className="px-8 py-4 bg-[#C85C3C] hover:bg-[#B14B2D] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#C85C3C]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shrink-0 min-w-50"
                >
                  <MapPin size={14} />
                  Tiếp Theo
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              /* Step 2 footer */
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A08880]">
                    TỔNG THANH TOÁN
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-black text-[#C85C3C]">
                      {formatCurrency(
                        selectedPlan ? Math.round(selectedPlan._totalPrice) : 0,
                      )}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A08880]">
                    {selectedPlan?._months === 1
                      ? "Tự động gia hạn hàng tháng"
                      : `${selectedPlan?._months} tháng · Thanh toán một lần`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                  <button
                    onClick={handleBack}
                    className="px-5 py-4 border-2 border-[#F0DDD5] hover:border-[#C85C3C]/30 text-[#7A645D] rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={14} />
                    Quay lại
                  </button>

                  <button
                    onClick={handleSubscribe}
                    disabled={submitting}
                    className="px-8 py-4 bg-[#C85C3C] hover:bg-[#B14B2D] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#C85C3C]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-48"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        XÁC NHẬN ĐĂNG KÝ
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
