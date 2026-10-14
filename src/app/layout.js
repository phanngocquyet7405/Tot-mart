import "@fontsource/playfair-display/latin-400.css";
import "@fontsource/playfair-display/vietnamese-400.css";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/vietnamese-700.css";
import "@fontsource/plus-jakarta-sans/latin-400.css";
import "@fontsource/plus-jakarta-sans/vietnamese-400.css";
import "@fontsource/plus-jakarta-sans/latin-700.css";
import "@fontsource/plus-jakarta-sans/vietnamese-700.css";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AppContextProvider } from "./context/AppContext";
import { AdminNotificationProvider } from "./context/NotificationContext";
import { CartProvider } from "@/app/context/CartContext";
import { WishlistProvider } from "@/app/context/WishlistContext";
import "./globals.css";

export const metadata = {
  title: "TotMart - Sản Phẩm Hữu Cơ Chất Lượng Cao",
  description:
    "Khám phá những sản phẩm hữu cơ chất lượng cao, từ các vùng nguyên liệu sạch và bền vững. TotMart cam kết mang đến cho bạn những sản phẩm tốt nhất từ thiên nhiên.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({ children }) {
  // locale đọc từ cookie TOTMART_LOCALE trong i18n/request.js (setup "không
  // có [locale] trong URL" — xem comment trong file đó). Phải bọc
  // NextIntlClientProvider ở đây thì useLocale()/useTranslations() trong
  // client component (vd. LanguageSwitcher) mới có context để dùng.
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      style={{ "--font-serif": "\"Playfair Display\", Georgia, serif", "--font-sans": "\"Plus Jakarta Sans\", Arial, sans-serif" }}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* 2. Bọc CartProvider + WishlistProvider xung quanh children */}
          <AppContextProvider>
            <CartProvider>
              <WishlistProvider>
                {/* Toast notification — render vào document.body qua portal */}
                <AdminNotificationProvider>{children}</AdminNotificationProvider>
              </WishlistProvider>
            </CartProvider>
          </AppContextProvider>
        </NextIntlClientProvider>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
