"use client";

import { Toaster } from "sonner";
import AnnouncementBarBox from "@/components_box/announcement-bar";
import { Navigation, HEADER_H } from "@/components_box/nav_box";
import Footer from "../components/ui/footer";
import { withAuth } from "@/app/middleware/authMiddleware";

// ─── Inner layout (bọc bởi withAuth bên dưới) ────────────────────────────────
function ProfileLayout({ children }) {
  return (
    <>
      {/* ── Fixed header layer ── */}
      <AnnouncementBarBox />
      <Navigation />

      {/* ── Scrollable body ── */}
      <div
        className="min-h-screen bg-[#FFFAF8]"
        style={{ paddingTop: HEADER_H }}
      >
        {children}
      </div>

      {/* ── Footer ── */}
      <Footer />

      {/* ── Global toast (richColors, position nhất quán) ── */}
      <Toaster richColors position="top-right" />
    </>
  );
}

// withAuth bảo vệ toàn bộ layout — cả profile lẫn my-subscriptions
export default withAuth(ProfileLayout);
