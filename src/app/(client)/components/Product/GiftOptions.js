"use client";

import { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import { formatPrice } from "./productDetailService";
import { axiosConfig } from "@/app/services/api/axiosConfig";

const WRAP_LABELS = {
  classic: "Gói giấy cổ điển kèm ruy băng",
  premium: "Hộp quà cao cấp",
  eco: "Gói giấy tái chế thân thiện môi trường",
};

const MESSAGE_LIMIT = 150;

/**
 * @param {(giftData: {enabled:boolean, option:object|null, message:string}) => void=} onChange
 * @param {boolean} [ownerConfirmed=true] Cho phép chọn gói quà theo chính sách thương mại
 * @param {object} [policy] Chính sách commerce-policy từ BE nếu có sẵn
 */
export function GiftOptions({ onChange, ownerConfirmed = true, policy = null }) {
  const [fetchedFees, setFetchedFees] = useState(null);
  const wrappingFees = policy?.wrappingFees || fetchedFees || { none: 0, classic: 15000, eco: 15000, premium: 35000 };
  const [enabled, setEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState("classic");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!ownerConfirmed || policy?.wrappingFees) return;
    let active = true;
    axiosConfig
      .get("/commerce-policy")
      .then((res) => {
        if (active && res.data?.data?.wrappingFees) {
          setFetchedFees(res.data.data.wrappingFees);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [ownerConfirmed, policy?.wrappingFees]);

  if (!ownerConfirmed) {
    return null;
  }

  const wrapOptions = [
    { id: "classic", label: WRAP_LABELS.classic, price: wrappingFees?.classic ?? 15000 },
    { id: "premium", label: WRAP_LABELS.premium, price: wrappingFees?.premium ?? 35000 },
    { id: "eco", label: WRAP_LABELS.eco, price: wrappingFees?.eco ?? 15000 },
  ];

  const selectedOption = wrapOptions.find((o) => o.id === selectedId) || wrapOptions[0];

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    onChange?.({ enabled: next, option: next ? selectedOption : null, message });
  };

  const handleSelect = (option) => {
    setSelectedId(option.id);
    onChange?.({ enabled: true, option, message });
  };

  const handleMessage = (value) => {
    const trimmed = value.slice(0, MESSAGE_LIMIT);
    setMessage(trimmed);
    onChange?.({ enabled, option: selectedOption, message: trimmed });
  };

  return (
    <div className="bg-card rounded-2xl p-5 space-y-4 border border-border shadow-xs">
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
          Đóng gói quà tặng
        </h3>
      </div>

      <label className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border cursor-pointer hover:border-primary/40 transition-colors">
        <span className="text-sm font-bold text-foreground">
          Đây là quà tặng — thêm gói quà
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          className="w-5 h-5 accent-primary cursor-pointer"
        />
      </label>

      {enabled && (
        <div className="space-y-3 pt-1">
          <div className="space-y-2">
            {wrapOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center justify-between gap-3 p-3 bg-card rounded-xl border-2 cursor-pointer transition-all ${
                  selectedId === option.id
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="gift-wrap"
                    checked={selectedId === option.id}
                    onChange={() => handleSelect(option)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-foreground font-medium">{option.label}</span>
                </span>
                <span className="text-sm font-black text-primary shrink-0 tabular-nums">
                  +{formatPrice(option.price)}
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Lời nhắn kèm quà (tuỳ chọn)
            </label>
            <textarea
              value={message}
              onChange={(e) => handleMessage(e.target.value)}
              rows={3}
              maxLength={MESSAGE_LIMIT}
              placeholder="Viết vài dòng gửi gắm yêu thương..."
              className="w-full text-sm p-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            />
            <p className="text-[11px] text-muted-foreground text-right tabular-nums">
              {message.length}/{MESSAGE_LIMIT} ký tự
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
