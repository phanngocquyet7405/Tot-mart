"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/**
 * Nút toggle sáng/tối. Dùng bg-accent/text-foreground (token trong
 * globals.css) nên tự đổi màu đúng theo theme ở bất kỳ đâu — kể cả
 * trong header client vốn chủ yếu dùng màu hardcode (bg-white, text-gray...).
 */
export function ThemeToggle({ className = "" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Tránh hydration mismatch — next-themes chỉ biết theme thật sau khi mount ở client
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={`w-8 h-8 ${className}`} aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors ${className}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
