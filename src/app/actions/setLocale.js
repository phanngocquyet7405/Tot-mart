"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isSupportedLocale } from "@/i18n/config";

/**
 * Đổi ngôn ngữ hiện tại. Gọi trực tiếp từ client component (LanguageSwitcher)
 * bọc trong startTransition() để có trạng thái pending mượt hơn.
 */
export async function setLocale(locale) {
  if (!isSupportedLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 năm
    sameSite: "lax",
  });

  // Render lại toàn bộ layout với locale mới — không cần middleware riêng
  revalidatePath("/", "layout");
}
