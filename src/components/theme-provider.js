"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Bọc quanh toàn bộ app trong layout.js. Dùng attribute="class" vì
 * globals.css đã định nghĩa `@custom-variant dark (&:is(.dark *));`
 * — next-themes chỉ cần toggle class "dark" trên <html>.
 */
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
