"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * ThemeProvider component để quản lý giao diện sáng/tối (Light/Dark mode).
 * Bao bọc ứng dụng của bạn trong component này tại file layout.js.
 */
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
