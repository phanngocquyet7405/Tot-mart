"use client";

import { useState, useEffect } from "react";

const announcements = [
  "Free shipping on orders over $50! Use code FREESHIP",
  "New Spring Collection Now Available - Shop Now!",
  "Subscribe & Save 20% on Your First Box",
];

export default function AnnouncementBarBox() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white text-[11px] font-bold uppercase tracking-widest h-10 relative overflow-hidden flex items-center justify-center">
      {announcements.map((text, index) => (
        <div
          key={index}
          className={`w-full absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out px-4 text-center ${
            index === currentIndex
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          {text}
        </div>
      ))}
    </div>
  );
}
