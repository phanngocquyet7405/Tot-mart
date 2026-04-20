import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppContextProvider } from "./context/AppContext";
import "./globals.css";

// Cấu hình font
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

/**
 * Metadata cho ứng dụng.
 * Next.js sẽ tự động đọc object này để chèn vào thẻ <head>.
 */
export const metadata = {
  // title: "TotMart - Curated Subscription Boxes"
  title: "Chill with Q....",
  description:
    "Discover curated subscription boxes filled with handpicked products from artisan makers. Subscribe to TotMart for monthly surprises.",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Bạn có thể thêm biến font vào className nếu muốn sử dụng font Geist */}
      <body className="font-sans antialiased">
        <AppContextProvider>{children}</AppContextProvider>

        {/* Chỉ bật Analytics khi chạy trên môi trường production */}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
