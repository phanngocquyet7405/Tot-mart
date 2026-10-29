"use client";
/**
 * AddressStep.js
 * Bước 1 — Chọn / nhập địa chỉ giao hàng + ghi chú.
 * Chuẩn hóa: Nhãn gắn input (htmlFor + id), vùng chạm >= 44px, token ngữ nghĩa.
 */

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Tag, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { SectionCard } from "./SectionCard";

const ADDRESS_FIELDS = [
  { key: "fullName",  label: "Họ tên người nhận",  full: false, required: true },
  { key: "phone",     label: "Số điện thoại",       full: false, required: true },
  { key: "street",    label: "Số nhà, tên đường",   full: true,  required: true },
  { key: "ward",      label: "Phường / Xã",         full: false, required: true },
  { key: "district",  label: "Quận / Huyện",        full: false, required: true },
  { key: "province",  label: "Tỉnh / Thành phố",   full: false, required: true },
];

function AddressRadioCard({ addr, index, selected, user, onSelect }) {
  const radioId = `addr-saved-${addr._id || index}`;
  return (
    <label
      htmlFor={radioId}
      className={[
        "flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-colors duration-200 pointer-coarse:min-h-11",
        selected
          ? "border-primary bg-primary/10 shadow-xs"
          : "border-border bg-card hover:border-primary/40",
      ].join(" ")}
    >
      {/* Radio dot */}
      <div
        className={[
          "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-200",
          selected ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background",
        ].join(" ")}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
      </div>
      <input
        type="radio"
        id={radioId}
        name="address"
        className="sr-only"
        checked={selected}
        onChange={onSelect}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-foreground">
            {addr.fullName || addr.name || user?.name}
          </p>
          {index === 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
              Mặc định
            </span>
          )}
        </div>
        {addr.phone && (
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">{addr.phone}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {[addr.address, addr.district, addr.city, addr.country]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>
    </label>
  );
}

function NewAddressForm({ newAddress, onChange, fieldErrors = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 pt-4 border-t border-border">
        {ADDRESS_FIELDS.map(({ key, label, full, required }) => {
          const inputId = `new-addr-${key}`;
          const errorMsg = fieldErrors[key];
          return (
            <div key={key} className={full ? "sm:col-span-2" : ""}>
              <label
                htmlFor={inputId}
                className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold block mb-1.5"
              >
                {label} {required && <span className="text-destructive">*</span>}
              </label>
              <input
                id={inputId}
                name={key}
                value={newAddress[key] || ""}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={label}
                aria-required={required}
                aria-invalid={Boolean(errorMsg)}
                className={`w-full bg-background border rounded-xl px-3.5 py-2.5 min-h-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors ${
                  errorMsg ? "border-destructive ring-1 ring-destructive" : "border-border"
                }`}
              />
              {errorMsg && (
                <p className="text-xs text-destructive mt-1 font-medium" role="alert">
                  {errorMsg}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

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
  savingAddress,
  fieldErrors = {},
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
          <div className="space-y-2.5 mb-4">
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
                type="button"
                onClick={() => setShowAllAddresses(!showAllAddresses)}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-bold transition-colors min-h-11"
              >
                {showAllAddresses ? (
                  <><ChevronUp size={14} /> Thu gọn danh sách địa chỉ</>
                ) : (
                  <><ChevronDown size={14} /> Xem thêm {addresses.length - 2} địa chỉ đã lưu</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Toggle add new */}
        <button
          type="button"
          onClick={onToggleAddNew}
          className={[
            "text-xs font-bold flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border-2 transition-colors min-h-11",
            addingNew
              ? "border-primary text-primary bg-primary/10"
              : "border-border text-foreground hover:border-primary/40 hover:bg-muted",
          ].join(" ")}
        >
          <Plus size={14} />
          {addingNew ? "Đang nhập địa chỉ mới" : "Thêm địa chỉ mới"}
        </button>

        <AnimatePresence>
          {addingNew && (
            <NewAddressForm
              newAddress={newAddress}
              onChange={onAddressFieldChange}
              fieldErrors={fieldErrors}
            />
          )}
        </AnimatePresence>
      </SectionCard>

      {/* ─── Ghi chú ─── */}
      <SectionCard title="Ghi chú đơn hàng" icon={<Tag size={16} />}>
        <label htmlFor="checkout-order-note" className="sr-only">
          Ghi chú đơn hàng
        </label>
        <textarea
          id="checkout-order-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Ghi chú cho người giao hàng (không bắt buộc)..."
          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 min-h-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-none"
        />
      </SectionCard>

      {/* ─── CTA ─── */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed || savingAddress}
        className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-4 min-h-11 rounded-2xl font-bold uppercase tracking-widest text-xs transition-colors active:scale-[0.98] disabled:cursor-not-allowed shadow-xs"
      >
        {savingAddress ? "Đang lưu địa chỉ…" : "Tiếp theo → Kiểm tra đơn"}
      </button>
    </motion.div>
  );
}
