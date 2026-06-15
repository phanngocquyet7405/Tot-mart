import Image from "next/image";
import Link from "next/link";

// ─── Link data ────────────────────────────────────────────────────────────────
// Các mục có page tương ứng trong /pages/ → dùng <Link href="/pages/...">
// Các mục chưa có page → giữ href="#" để dễ cập nhật sau

const INFORMATION_LINKS = [
  { label: "About Us", href: "/pages/about" },
  { label: "Today's Offers", href: "/pages/offers-discounts-coupons" },
  { label: "Refer a Friend", href: "#" },
  { label: "Corporate Gifts", href: "#" },
  { label: "Rewards", href: "#" },
  { label: "Blogs", href: "/pages/our-blog" },
  { label: "Careers", href: "#" },
];

const SUPPORT_LINKS = [
  { label: "Contact Us", href: "/pages/contact-us" },
  { label: "Community", href: "#" },
  { label: "Privacy Policy", href: "/pages/information" },
  { label: "Terms", href: "/pages/information" },
  { label: "FAQ", href: "/pages/faq" },
  { label: "Shipping Policy", href: "/pages/information" },
  { label: "Accessibility Statement", href: "#" },
];

const BRAND_LINKS = [
  { label: "TotMart Snack Box", href: "#" },
  { label: "TotMart Boutique", href: "#" },
  { label: "TotMart Market", href: "#" },
];

const PAY_METHODS = [
  "VISA",
  "MC",
  "AMEX",
  "PAYPAL",
  "MOMO",
  "VNPAY",
  "ZALOPAY",
];

const SOCIAL = [
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Facebook",
    href: "#",
    path: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
  },
  {
    label: "TikTok",
    href: "#",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.53-.33 3.11-1.08 4.41-1.5 2.62-4.5 4.26-7.53 4.21-3.05-.05-5.95-1.92-7.14-4.75-1.1-2.61-.63-5.74 1.15-7.89 1.6-1.93 4.09-2.98 6.54-2.9v4.03c-1.37.03-2.76.62-3.6 1.71-.97 1.25-1.14 3.05-.36 4.43.83 1.48 2.5 2.41 4.19 2.37 1.65-.04 3.19-1.07 3.83-2.58.33-.78.47-1.64.48-2.5v-16.14h3.91z",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="bg-[#1c2a33] text-white w-full font-sans">
      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 — Branding + QR */}
          <div className="flex flex-col">
            <Link
              href="/homepage"
              className="flex items-center gap-2 mb-6 group transition-opacity hover:opacity-90"
            >
              <div className="flex items-center gap-2 mb-6">
                <Image
                  src="/assets/logo.png"
                  alt="TotMart Logo"
                  width={180}
                  height={180}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <p className="text-xs text-gray-200 mb-4 font-medium leading-relaxed">
              Download our app to get
              <br />
              app-exclusive offers and
              <br />
              discounts!
            </p>

            <div className="w-24 h-24 bg-white p-1 rounded-sm flex items-center justify-center">
              <div className="border border-gray-300 w-full h-full flex items-center justify-center text-gray-800 text-[10px] font-bold">
                QR CODE
              </div>
            </div>
          </div>

          {/* Col 2 — Brands */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider mb-6">
              BRANDS
            </h4>
            <ul className="space-y-4">
              {BRAND_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-200 hover:text-white transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Information (links trỏ /pages/) */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider mb-6">
              INFORMATION
            </h4>
            <ul className="space-y-4">
              {INFORMATION_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-200 hover:text-white transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Support (links trỏ /pages/) */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider mb-6">
              SUPPORT
            </h4>
            <ul className="space-y-4">
              {SUPPORT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-200 hover:text-white transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — We Accept */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider mb-6">
              WE ACCEPT
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {PAY_METHODS.map((method) => (
                <div
                  key={method}
                  className="bg-white rounded-xs flex items-center justify-center h-6 px-1 w-full shadow-sm"
                >
                  <div className="text-[8px] text-black font-bold truncate">
                    {method}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10 bg-[#1c2a33]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-[10px] md:text-xs text-gray-400 tracking-widest uppercase font-medium order-2 md:order-1">
            © 2026 TotMart Box. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center space-x-6 order-1 md:order-2">
            {SOCIAL.map(({ label, href, path }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-gray-400 hover:text-white transition-all hover:scale-110"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
