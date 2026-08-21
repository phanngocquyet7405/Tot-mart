import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isSupportedLocale,
} from "./config";

/**
 * Setup "without i18n routing": không có [locale] trong URL, không cần
 * middleware riêng cho i18n. Locale được lưu trong cookie và đọc lại ở đây
 * cho mỗi request (Server Component render pass).
 *
 * Đổi locale: gọi Server Action `setLocale()` trong app/actions/setLocale.js
 * (set cookie + revalidatePath) — xem LanguageSwitcher.jsx.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
