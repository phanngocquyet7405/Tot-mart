"use client";

import { Navigation } from "@/components_box/nav_box";

/**
 * MainHeader (Chuẩn hoá theo TotMart Craft & Gift)
 * Re-export Navigation chuẩn để toàn bộ client pages sử dụng chung một header thống nhất.
 */
export default function MainHeader() {
  return <Navigation />;
}
