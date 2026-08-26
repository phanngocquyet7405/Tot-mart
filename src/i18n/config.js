/**
 * i18n/config.js
 * Hằng số dùng chung cho giao diện tiếng Việt.
 * KHÔNG import file này vào i18n/request.js theo kiểu side-export khác —
 * next-intl khuyến nghị request.js chỉ nên export default getRequestConfig.
 */

export const SUPPORTED_LOCALES = ["vi"];
export const DEFAULT_LOCALE = "vi";
export const LOCALE_COOKIE = "TOTMART_LOCALE";

export const LOCALE_LABELS = {
  vi: { short: "VI", full: "Tiếng Việt" },
  en: { short: "EN", full: "English" },
};

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}
