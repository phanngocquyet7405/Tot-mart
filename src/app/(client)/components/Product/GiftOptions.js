"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { formatPrice } from "./productDetailService";

const WRAP_OPTIONS = [
  { id: "classic", label: "Gói giấy cổ điển kèm ruy băng", price: 15000 },
  { id: "premium", label: "Hộp quà cao cấp", price: 35000 },
  { id: "eco", label: "Gói giấy tái chế thân thiện môi trường", price: 15000 },
];

const MESSAGE_LIMIT = 150;

/**
 * @param {(giftData: {enabled:boolean, option:object|null, message:string}) => void=} onChange
 *   Callback báo lại lựa chọn quà tặng cho page cha (ví dụ để cộng thêm phí
 *   gói quà vào tổng đơn ở bước checkout). Không truyền vẫn hoạt động, chỉ
 *   không có nơi nào nhận state này.
 */
export function GiftOptions({ onChange }) {
  const [enabled, setEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");

  const selectedOption = WRAP_OPTIONS.find((o) => o.id === selectedId) || null;

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    onChange?.({ enabled: next, option: selectedOption, message });
  };

  const handleSelect = (option) => {
    setSelectedId(option.id);
    onChange?.({ enabled, option, message });
  };

  const handleMessage = (value) => {
    const trimmed = value.slice(0, MESSAGE_LIMIT);
    setMessage(trimmed);
    onChange?.({ enabled, option: selectedOption, message: trimmed });
  };

  return (
    <div className="bg-amber-50/60 rounded-2xl p-6 space-y-4 border border-amber-100">
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-amber-800" />
        <h3 className="text-xs font-black uppercase tracking-widest text-stone-800">
          Đóng gói quà tặng
        </h3>
      </div>

      <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 cursor-pointer">
        <span className="text-sm font-bold text-stone-800">
          Đây là quà tặng — thêm gói quà
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          className="w-5 h-5 accent-amber-800"
        />
      </label>

      {enabled && (
        <div className="space-y-3 pt-1">
          <div className="space-y-2">
            {WRAP_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-center justify-between gap-3 p-3 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                  selectedId === option.id
                    ? "border-amber-700 ring-2 ring-amber-100"
                    : "border-stone-200 hover:border-amber-300"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="gift-wrap"
                    checked={selectedId === option.id}
                    onChange={() => handleSelect(option)}
                    className="w-4 h-4 accent-amber-800"
                  />
                  <span className="text-sm text-stone-700">{option.label}</span>
                </span>
                <span className="text-sm font-black text-amber-800 shrink-0">
                  +{formatPrice(option.price)}
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              Lời nhắn kèm quà (tuỳ chọn)
            </label>
            <textarea
              value={message}
              onChange={(e) => handleMessage(e.target.value)}
              rows={3}
              maxLength={MESSAGE_LIMIT}
              placeholder="Viết vài dòng gửi gắm yêu thương..."
              className="w-full text-sm p-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none resize-none bg-white"
            />
            <p className="text-[11px] text-stone-400 text-right">
              {message.length}/{MESSAGE_LIMIT} ký tự
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
