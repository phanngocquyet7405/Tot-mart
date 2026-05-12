import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppContextProvider } from "./context/AppContext";
import { NotificationProvider } from "./context/NotificationContext";
import { CartProvider } from "@/app/context/CartContext";
import "./globals.css";

// Cấu hình font
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

/**
 * Metadata cho ứng dụng.
 */
export const metadata = {
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
      <body className="font-sans antialiased">
        {/* 2. Bọc CartProvider xung quanh children */}
        <AppContextProvider>
          <CartProvider>
            {/* Toast notification — render vào document.body qua portal */}
            <NotificationProvider>{children}</NotificationProvider>
          </CartProvider>
        </AppContextProvider>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
