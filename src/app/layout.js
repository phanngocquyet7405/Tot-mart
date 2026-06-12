import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppContextProvider } from "./context/AppContext";
import { NotificationProvider } from "./context/NotificationContext";
import { CartProvider } from "@/app/context/CartContext";
import "./globals.css";

// Cấu hình font cho Vietnamese
const playfairDisplay = Playfair_Display({ 
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-serif"
});
const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans"
});

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

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${playfairDisplay.variable} ${plusJakartaSans.variable}`}>
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
