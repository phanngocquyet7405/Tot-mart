"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { X, ChevronLeft, ChevronRight, Truck, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ProductGallery } from '../Product/ProductGallery';
import PlanComparison from './PlanComparison';
import { subscriptionApi, getPendingSubscription } from '@/app/services/api/subscribePlanService';
import { needsReconciliation, maskedAddress } from '@/app/util/purchaseAttempt.mjs';
import { checkTokenValid } from '@/app/middleware/tokenMiddleware';
import { userService } from '@/app/services/api/userService';
import { formatCurrency } from '@/app/util/formatter';
import logger from '@/app/util/Logger';
const PLACEHOLDER = '/assets/placeholder.png';
const EMPTY_PLANS = [];
const PLAN_MONTHS = { '1_month': 1, '3_month': 3, '6_month': 6, '12_month': 12 };
const EMPTY_ADDRESS = { address: '', district: '', city: '', country: 'Vietnam', zipCode: '', phone: '' };
function buildDisplayPlans(apiPlans) {
  return apiPlans.filter(p => p._id && p.isActive !== false && PLAN_MONTHS[p.planType] && Number.isSafeInteger(p.discountPrice ?? p.basePrice) && (p.discountPrice ?? p.basePrice) > 0).sort((a,b) => PLAN_MONTHS[a.planType] - PLAN_MONTHS[b.planType]).map(p => ({
    ...p, _displayType: p.planType, _isReal: true, _months: PLAN_MONTHS[p.planType],
    _totalPrice: p.discountPrice ?? p.basePrice, _pricePerMonth: (p.discountPrice ?? p.basePrice) / PLAN_MONTHS[p.planType],
  }));
}
function AddressField({ name, label, value, onChange, error, required = false, autoComplete, type = 'text' }) {
  const id = `subscription-${name}`;
  return <div className="tm-address-field">
    <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    <input id={id} name={name} value={value} type={type} onChange={onChange} required={required} autoComplete={autoComplete}
      aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
    {error && <p id={`${id}-error`} className="text-sm text-red-700">Vui lòng kiểm tra {label.toLowerCase()}.</p>}
  </div>;
}

export default function ChoosePlanModal({ box, onClose, plansProps = EMPTY_PLANS }) {
  const router = useRouter();

  // ── Plan state ──
  const [displayPlans, setDisplayPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState('');
  const [plansReload, setPlansReload] = useState(0);
  const [userError, setUserError] = useState('');
  const opener = useRef(typeof document === 'undefined' ? null : document.activeElement);
  const [selectedImage, setSelectedImage] = useState(box?.images?.[0]?.url || box?.image);

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
  const pending = getPendingSubscription();
  const resumePending = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await subscriptionApi.subscribe({}, { resume: true });
      onClose();
      router.push(`/checkout?code=${encodeURIComponent(res.data.paymentCode)}`);
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

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
          setPlansError('Không tải được kỳ hạn. Vui lòng thử lại.');
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
        const addrs = fetched?.addresses || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedSavedAddr(0);
        } else {
          setUseManual(true);
        }
      } catch (err) {
        logger.error("[ChoosePlanModal] Lỗi lấy user:", err);
        setUserError('Chưa tải được địa chỉ đã lưu. Bạn có thể nhập địa chỉ khác bên dưới.');
        setUseManual(true);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserData();
  }, [box, plansProps, plansReload]);

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
    if (!/^[0-9()+\s-]{7,20}$/.test(addr.phone?.trim() || "")) errors.phone = true;
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
    if (submitting) return;
    if (!selectedPlan?._isReal || !selectedPlan?._id) {
      toast.error("Gói này chưa khả dụng!");
      return;
    }
    const resolved = getResolvedAddress();
    if (!resolved) {
      toast.error("Vui lòng chọn hoặc nhập địa chỉ giao hàng!");
      return;
    }

    {
      const errors = validateAddress(resolved);
      if (Object.keys(errors).length > 0) {
        setAddressErrors(errors);
        document.getElementById(`subscription-${Object.keys(errors)[0]}`)?.focus();
        toast.error("Vui lòng điền đầy đủ thông tin địa chỉ!");
        return;
      }
    }

    const shippingAddress = {
      address: resolved.address.trim(),
      district: resolved.district.trim(),
      city: resolved.city.trim(),
      country: resolved.country || "Vietnam",
      phone: resolved.phone.trim(),
      zipCode: resolved.zipCode || "",
    };

    // Keep recipient data out of browser logs.

    try {
      setSubmitting(true);
      const res = await subscriptionApi.subscribe({
        templateId: selectedPlan._id,
          expectedTotalAmount: Math.round(selectedPlan._totalPrice),
        shippingAddress,
      }, { summary: { name: box.name, months: selectedPlan._months, totalAmount: selectedPlan._totalPrice, address: maskedAddress(shippingAddress) } });

      if (res?.success && res?.data?._id) {
        toast.success("Đã tạo gói chờ thanh toán.");
        onClose();
        router.push(`/checkout?code=${encodeURIComponent(res.data.paymentCode)}`);
      }
    } catch (err) {
      logger.error("[ChoosePlanModal] Lỗi subscribe:", err);
      toast.error(
        err?.response?.data?.errors?.map((e) => e.message).join(" | ") ||
        err?.response?.data?.message ||
          err.message || "Đăng ký thất bại, vui lòng thử lại sau.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!box) return null;
  const giftItems = Array.isArray(selectedPlan?.gift) ? selectedPlan.gift.filter(g => g?.boxId?.name) : [];
  const fields = [
    ['address', 'Địa chỉ cụ thể', 'street-address', true], ['district', 'Quận / Huyện', 'address-level2', true],
    ['city', 'Tỉnh / Thành phố', 'address-level1', true], ['country', 'Quốc gia', 'country-name', false],
    ['zipCode', 'Mã bưu điện', 'postal-code', false], ['phone', 'Số điện thoại', 'tel', true],
  ];
  return <Dialog open onOpenChange={open => { if (!open && !submitting) onClose(); }}>
    <DialogContent showCloseButton={false} className="tm-commerce tm-commerce--atelier tm-modal w-[calc(100%-1rem)] max-w-5xl sm:max-w-5xl gap-0 z-100"
      onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus(); }}
      onEscapeKeyDown={event => { if (submitting) event.preventDefault(); }} onInteractOutside={event => { if (submitting) event.preventDefault(); }}>
      <button type="button" className="absolute right-3 top-3 z-10 grid min-h-11 min-w-11 place-items-center rounded-full border border-[#F0DDD5] bg-white" aria-label="Đóng chọn gói" onClick={onClose} disabled={submitting}><X size={20} /></button>
      <div className="tm-modal__layout">
        <div className="tm-modal__gallery">
          <ProductGallery compact images={galleryImages} productName={box.name} selectedImage={selectedImage} onSelectImage={setSelectedImage} />
          <p className="mt-6 text-sm text-stone-600">Trả trước theo kỳ đã chọn. Sau xác nhận thanh toán, lượt giao đầu tiên đến hạn sau một tháng.</p>
          <div className="tm-delivery-note mt-5"><Truck size={20} className="shrink-0" /><p>Khách trả phí vận chuyển riêng cho từng lần giao, ngoài tiền gói TotMart.</p></div>
        </div>
        <div className="tm-modal__body">
          <DialogTitle className="tm-product-title pr-10">{step === 1 ? box.name : 'Địa chỉ nhận hàng'}</DialogTitle>
          <DialogDescription className="mt-3 text-sm text-stone-600">{step === 1 ? 'So sánh tổng trả trước và bình quân tháng để chọn kỳ hạn phù hợp.' : `Nhận ${box.name} theo kỳ hạn ${selectedPlan?._months} tháng đã chọn.`}</DialogDescription>
          <p className="my-5 text-sm font-semibold text-stone-600" aria-live="polite">Bước {step}/2 · {step === 1 ? 'Chọn kỳ hạn' : 'Chọn địa chỉ'}</p>
          {pending && <section className="tm-notice mb-6" role="status">
            <h3>Yêu cầu đăng ký trước chưa rõ kết quả</h3>
            <p className="mt-2">{pending.summary?.name || pending.payload.templateId} · {pending.summary?.months || '?'} tháng.</p>
            <dl><div><dt>Tổng trả trước</dt><dd>{Number.isFinite(pending.payload.expectedTotalAmount) ? formatCurrency(pending.payload.expectedTotalAmount) : 'Cần đối chiếu'}</dd></div><div><dt>Địa chỉ cũ</dt><dd>{pending.summary?.address || maskedAddress(pending.payload.shippingAddress)}</dd></div><div><dt>Thời điểm gửi</dt><dd>{pending.sentAt ? new Date(pending.sentAt).toLocaleString('vi-VN') : 'Chưa lưu'}</dd></div></dl>
            <p>Gói và địa chỉ hiện tại không thay thế yêu cầu cũ. Hãy xử lý yêu cầu này trước khi đăng ký gói khác.</p>
            <p className="tm-notice__reference mt-3">Mã đối chiếu: {pending.key}</p>
            {needsReconciliation(pending) && <p className="mt-3 font-semibold">Cần TotMart xác minh. Chưa thể gửi lại hay bắt đầu lần thử mới.</p>}
            <div className="mt-4 flex flex-wrap gap-3"><button type="button" className="tm-button tm-button--outline" disabled={submitting || needsReconciliation(pending)} onClick={resumePending}>{submitting ? 'Đang kiểm tra…' : 'Tiếp tục yêu cầu cũ'}</button><Link className="tm-text-button" href="/pages/contact-us">Liên hệ TotMart</Link></div>
          </section>}
          {step === 1 ? <>
            {loadingPlans ? <p role="status" className="py-8">Đang tải kỳ hạn…</p> : plansError ? <div role="alert" className="space-y-3"><p>{plansError}</p><button type="button" className="tm-button tm-button--outline" onClick={()=>{setPlansError('');setPlansReload(n=>n+1);}}>Thử tải lại</button></div> : <PlanComparison plans={displayPlans} selectedId={selectedPlan?._id} onSelect={setSelectedPlan} />}
            {giftItems.length > 0 && <div className="mt-5 border-t border-[#F0DDD5] pt-4"><h3 className="font-semibold">Quà tặng kèm của kỳ hạn này</h3><ul className="mt-2 text-sm text-stone-600">{giftItems.map((gift,i)=><li key={i}>{gift.boxId.name} × {gift.quantity || 1}</li>)}</ul></div>}
          </> : <form id="subscription-address-form" onSubmit={event => {event.preventDefault();handleSubscribe();}}>
            {userData && <p className="mb-4 text-sm text-stone-600">Tài khoản: {userData.name || userData.email}</p>}
            {loadingUser && <p role="status">Đang tải địa chỉ…</p>}
            {userError && <p role="alert" className="mb-4 text-sm text-red-700">{userError}</p>}
            {!loadingUser && savedAddresses.length > 0 && <fieldset className="space-y-3"><legend className="mb-3 font-semibold">Địa chỉ đã lưu</legend>{savedAddresses.map((address,index)=><label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${!useManual && selectedSavedAddr === index ? 'border-[#B14B2D] bg-[#FFF0EB]' : 'border-[#F0DDD5]'}`} key={address._id || index}>
              <input className="mt-1 h-5 w-5 shrink-0" type="radio" name="saved-address" checked={!useManual && selectedSavedAddr === index} onChange={()=>selectSaved(address,index)} />
              <span className="text-sm"><strong className="block">{address.fullName || `Địa chỉ ${index+1}`}</strong>{[address.address,address.district,address.city].filter(Boolean).join(', ')}<span className="block mt-1">{address.phone}</span></span>
            </label>)}<button type="button" className="tm-text-button" onClick={useManual ? ()=>{setUseManual(false);setSelectedSavedAddr(0);} : switchToManual}>{useManual ? 'Dùng địa chỉ đã lưu' : 'Nhập địa chỉ khác'}</button></fieldset>}
            {!loadingUser && (useManual || savedAddresses.length === 0) && <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{fields.map(([name,label,autoComplete,required])=><div key={name} className={name === 'address' || name === 'phone' ? 'sm:col-span-2' : ''}><AddressField name={name} label={label} value={manualAddress[name]} autoComplete={autoComplete} required={required} type={name === 'phone' ? 'tel' : 'text'} error={addressErrors[name]} onChange={handleManualChange} /></div>)}</div>}
          </form>}
          <div className="tm-modal__footer">
            <div aria-live="polite"><p className="text-sm text-stone-600">Tổng trả trước</p><p className="tm-price mt-1">{selectedPlan ? formatCurrency(selectedPlan._totalPrice) : 'Chưa có kỳ hạn'}</p>{selectedPlan && <p className="mt-2 text-sm text-stone-600">{selectedPlan._months} tháng · Bình quân {formatCurrency(Math.round(selectedPlan._pricePerMonth))}/tháng</p>}<p className="mt-2 text-sm text-stone-600">Phí giao hàng trả riêng cho từng lần nhận.</p></div>
            {step === 1 ? <button type="button" className="tm-button tm-button--primary w-full" disabled={Boolean(pending) || loadingPlans || !selectedPlan?._isReal} onClick={handleNextStep}>Chọn địa chỉ nhận hàng<ChevronRight size={18} /></button> : <div className="flex flex-wrap gap-3"><button type="button" className="tm-button tm-button--outline" disabled={submitting} onClick={handleBack}><ChevronLeft size={18} />Đổi kỳ hạn</button><button type="submit" form="subscription-address-form" className="tm-button tm-button--primary grow" disabled={submitting || loadingUser || Boolean(pending)}>{submitting ? <><Loader2 size={18} className="animate-spin" />Đang gửi…</> : 'Xác nhận đăng ký'}</button></div>}
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
