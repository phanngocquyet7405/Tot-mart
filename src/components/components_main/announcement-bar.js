"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    text: "Miễn phí vận chuyển cho đơn từ 500K",
    cta: "Mua ngay →",
    href: "/homepage",
  },
  {
    text: "Bộ sưu tập Xuân Hè mới vừa ra mắt — Giới hạn số lượng",
    cta: "Khám phá →",
    href: "/totmartbox",
  },
  {
    text: "Tiết kiệm 20% với gói Subscribe — Dùng mã HELLO150",
    cta: "Đăng ký →",
    href: "/products/Subscriber",
  },
];

export const BAR_H = 40; // px — export để nav_box dùng chung

export default function AnnouncementBarBox() {
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);

  // Set CSS var để các component khác (layout, v.v.) có thể đọc
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--ann-h",
      dismissed ? "0px" : `${BAR_H}px`,
    );
  }, [dismissed]);

  const goto = (next) => {
    setFading(true);
    setTimeout(() => {
      setIdx((next + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
      setFading(false);
    }, 220);
  };

  useEffect(() => {
    if (dismissed) return;
    timerRef.current = setInterval(() => goto(idx + 1), 5000);
    return () => clearInterval(timerRef.current);
  }, [idx, dismissed]);

  // Khi dismissed, ẩn hoàn toàn nhưng vẫn giữ chỗ trong DOM (height = 0)
  if (dismissed) return null;

  const { text, cta, href } = ANNOUNCEMENTS[idx];

  return (
    // fixed top-0, toàn chiều ngang, z-50 để nằm trên mọi thứ
    // Nav sẽ được đặt top = BAR_H bên dưới
    <div
      className="fixed left-0 right-0 top-0 z-50 w-full bg-stone-900 text-white overflow-hidden"
      style={{ height: BAR_H }}
    >
      <div className="h-full max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-2">
        {/* Prev */}
        <button
          onClick={() => {
            clearInterval(timerRef.current);
            goto(idx - 1);
          }}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-stone-500 hover:text-white rounded-full hover:bg-white/10 transition-all"
          aria-label="Trước"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Message */}
        <div
          className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 0.22s" }}
        >
          <p className="text-[11px] sm:text-xs font-medium text-stone-200 truncate leading-none">
            {text}
          </p>
          <Link
            href={href}
            className="shrink-0 text-[11px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 whitespace-nowrap transition-colors"
          >
            {cta}
          </Link>
        </div>

        {/* Dot indicators */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          {ANNOUNCEMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                clearInterval(timerRef.current);
                goto(i);
              }}
              aria-label={`Thông báo ${i + 1}`}
              style={{
                width: i === idx ? 14 : 5,
                height: 5,
                borderRadius: 99,
                background: i === idx ? "#f59e0b" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => {
            clearInterval(timerRef.current);
            goto(idx + 1);
          }}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-stone-500 hover:text-white rounded-full hover:bg-white/10 transition-all"
          aria-label="Tiếp theo"
        >
          <ChevronRight size={14} />
        </button>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-stone-600 hover:text-white rounded-full hover:bg-white/10 transition-all"
          aria-label="Đóng"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
