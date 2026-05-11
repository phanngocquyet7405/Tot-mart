import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation } from "@/components_box/nav_box";
import { Newsletter } from "@/components_box/newsletter";
import Footer from "../components/ui/footer";
import CartDrawer from "../components/Cart_component/cart_drawer";

/**
 * Layout heights (must match constants in their respective components):
 *   Announcement bar : 40px  → CSS var --ann-h  (set dynamically; 0 when dismissed)
 *   Navigation       : 60px  → NAV_H constant in nav_box.js
 *
 * The <main> top-padding equals ann-h + nav-h so page content
 * always starts below both bars — even when the announcement bar
 * is dismissed (--ann-h becomes 0px automatically).
 */
const NAV_H = 60; // keep in sync with nav_box.js

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#faf8f4] font-sans">
      {/* 1. Announcement bar — fixed at the very top */}
      <div className="fixed top-0 left-0 right-0 z-60">
        <AnnouncementBarBox />
      </div>

      {/* 2. Navigation — fixed below announcement bar (handled inside Navigation via style.top) */}
      <Navigation />

      {/* 3. Page content — padded so it clears both fixed bars */}
      <main
        style={{
          paddingTop: `calc(var(--ann-h, 40px) + ${NAV_H}px)`,
        }}
      >
        {children}
      </main>

      {/* 4. Newsletter + Footer */}
      <Newsletter />
      <Footer />
    </div>
  );
}
