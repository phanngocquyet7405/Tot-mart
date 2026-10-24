/**
 * AddressStep.js
 * Bước 1 — Chọn / nhập địa chỉ giao hàng + ghi chú
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Tag, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { SectionCard } from "./SectionCard";

const ADDRESS_FIELDS = [
  { key: "fullName",  label: "Họ tên người nhận",  full: false },
  { key: "phone",     label: "Số điện thoại",       full: false },
  { key: "street",    label: "Số nhà, tên đường",   full: true  },
  { key: "ward",      label: "Phường / Xã",         full: false },
  { key: "district",  label: "Quận / Huyện",        full: false },
  { key: "province",  label: "Tỉnh / Thành phố",   full: false },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function AddressRadioCard({ addr, index, selected, user, onSelect }) {
  return (
    <label
      className={[
        "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
        selected
          ? "border-[#C85C3C] bg-[#FFF5F2]"
          : "border-[#F0DDD5] bg-[#FFFAF8] hover:border-[#C85C3C]/40",
      ].join(" ")}
    >
      {/* Radio dot */}
      <div
        className={[
          "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
          selected ? "border-[#C85C3C] bg-[#C85C3C]" : "border-stone-300 bg-white",
        ].join(" ")}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <input
        type="radio"
        name="address"
        className="sr-only"
        checked={selected}
        onChange={onSelect}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-[#2C1810]">
            {addr.fullName || addr.name || user?.name}
          </p>
          {index === 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#C85C3C] text-white uppercase tracking-wide">
              Mặc định
            </span>
          )}
        </div>
        {addr.phone && (
          <p className="text-xs text-stone-500 mt-0.5">{addr.phone}</p>
        )}
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
          {[addr.street, addr.ward, addr.district, addr.province]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>
    </label>
  );
}

function NewAddressForm({ newAddress, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#F0DDD5]">
        {ADDRESS_FIELDS.map(({ key, label, full }) => (
          <div key={key} className={full ? "sm:col-span-2" : ""}>
            <label className="text-[10px] text-stone-400 uppercase tracking-widest font-bold block mb-1.5">
              {label}
            </label>
            <input
              value={newAddress[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={label}
              className="w-full bg-[#FFFAF8] border border-[#F0DDD5] rounded-xl px-3.5 py-2.5 text-sm text-[#2C1810] placeholder-stone-300 focus:outline-none focus:border-[#C85C3C] focus:ring-2 focus:ring-[#C85C3C]/10 transition-all"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AddressStep({
  user,
  addresses,
  displayedAddresses,
  selectedAddress,
  showAllAddresses,
  setShowAllAddresses,
  addingNew,
  newAddress,
  note,
  setNote,
  onSelectAddress,
  onToggleAddNew,
  onAddressFieldChange,
  onNext,
}) {
  const canProceed = selectedAddress || addingNew;

  return (
    <motion.div
      key="address"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-4"
    >
      {/* ─── Địa chỉ ─── */}
      <SectionCard title="Địa chỉ giao hàng" icon={<MapPin size={16} />}>
        {/* Saved addresses */}
        {addresses.length > 0 && (
          <div className="space-y-2 mb-4">
            {displayedAddresses.map((addr, i) => (
              <AddressRadioCard
                key={addr._id || i}
                addr={addr}
                index={i}
                user={user}
                selected={selectedAddress === addr}
                onSelect={() => onSelectAddress(addr)}
              />
            ))}

            {addresses.length > 2 && (
              <button
                onClick={() => setShowAllAddresses(!showAllAddresses)}
                className="text-xs text-[#C85C3C] hover:text-[#B14B2D] flex items-center gap-1 font-bold transition-colors"
              >
                {showAllAddresses ? (
                  <><ChevronUp size={14} /> Thu gọn</>
                ) : (
                  <><ChevronDown size={14} /> Xem thêm {addresses.length - 2} địa chỉ</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Toggle add new */}
        <button
          onClick={onToggleAddNew}
          className={[
            "text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-all",
            addingNew
              ? "border-[#C85C3C] text-[#C85C3C] bg-[#FFF5F2]"
              : "border-[#F0DDD5] text-stone-400 hover:border-[#C85C3C]/40 hover:text-[#C85C3C]",
          ].join(" ")}
        >
          <Plus size={12} />
          Thêm địa chỉ mới
        </button>

        <AnimatePresence>
          {addingNew && (
            <NewAddressForm newAddress={newAddress} onChange={onAddressFieldChange} />
          )}
        </AnimatePresence>
      </SectionCard>

      {/* ─── Ghi chú ─── */}
      <SectionCard title="Ghi chú đơn hàng" icon={<Tag size={16} />}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Ghi chú cho người giao hàng (không bắt buộc)..."
          className="w-full bg-[#FFFAF8] border border-[#F0DDD5] rounded-xl px-3.5 py-2.5 text-sm text-[#2C1810] placeholder-stone-300 focus:outline-none focus:border-[#C85C3C] focus:ring-2 focus:ring-[#C85C3C]/10 transition-all resize-none"
        />
      </SectionCard>

      {/* ─── CTA ─── */}
      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full bg-[#C85C3C] hover:bg-[#B14B2D] disabled:bg-stone-200 disabled:text-stone-400 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all active:scale-[0.98] disabled:cursor-not-allowed shadow-lg shadow-[#C85C3C]/20"
      >
        Tiếp theo → Kiểm tra đơn
      </button>
    </motion.div>
  );
}
