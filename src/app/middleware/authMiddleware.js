/**
 * authMiddleware.js
 *
 * Bảo vệ các route yêu cầu đăng nhập (chỉ cần có token hợp lệ, bất kể role).
 * Cung cấp 2 HOC:
 *  - withAuth   → Dành cho page yêu cầu đăng nhập (profile, checkout, order-history, ...)
 *  - withGuest  → Dành cho page CHỈ dành cho khách (login, register) — redirect nếu đã login
 *
 * Phối hợp với BE authMiddleware:
 *  BE kiểm tra `Authorization: Bearer <token>` và user.isActive.
 *  FE kiểm tra trước ở client → không gọi API nếu token rõ ràng đã hỏng.
 *
 * Cách dùng (Next.js App Router - "use client"):
 *   export default withAuth(ProfilePage);
 *   export default withGuest(LoginPage);
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AppContext } from "@/app/context/AppContext";
import { checkTokenValid } from "./tokenMiddleware";

// ─── withAuth ─────────────────────────────────────────────────────────────────

/**
 * HOC bảo vệ route yêu cầu đăng nhập.
 * Nếu token không hợp lệ → redirect /login?session=expired
 * Trong thời gian AppContext đang load → render null (tránh flash)
 *
 * @param {React.ComponentType} WrappedComponent
 * @param {object} [options]
 * @param {string} [options.redirectTo='/login'] - Trang redirect nếu chưa login
 * @returns {React.ComponentType}
 */
export function withAuth(WrappedComponent, options = {}) {
  const { redirectTo = "/login" } = options;

  function AuthGuard(props) {
    const router = useRouter();
    const { user, isLoading } = useContext(AppContext);

    useEffect(() => {
      if (isLoading) return; // Chờ AppContext khởi tạo xong

      // Kiểm tra kép: AppContext user + token thực tế trong storage
      const tokenOk = checkTokenValid();
      if (!user || !tokenOk) {
        router.replace(`${redirectTo}?session=expired`);
      }
    }, [user, isLoading, router]);

    // Đang load → không render gì (tránh flash nội dung)
    if (isLoading) return null;

    // Chưa có user → đã redirect, không render component
    if (!user || !checkTokenValid()) return null;

    return <WrappedComponent {...props} />;
  }

  // Giữ tên component cho debugging
  AuthGuard.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return AuthGuard;
}

// ─── withGuest ────────────────────────────────────────────────────────────────

/**
 * HOC dành cho trang login / register.
 * Nếu đã đăng nhập → redirect theo role.
 *
 * @param {React.ComponentType} WrappedComponent
 * @returns {React.ComponentType}
 */
export function withGuest(WrappedComponent) {
  function GuestGuard(props) {
    const router = useRouter();
    const { user, isLoading } = useContext(AppContext);

    useEffect(() => {
      if (isLoading) return;

      if (user && checkTokenValid()) {
        // Đã đăng nhập → redirect về trang phù hợp
        const destination = user.role === "admin" ? "/dashboard" : "/homepage";
        router.replace(destination);
      }
    }, [user, isLoading, router]);

    if (isLoading) return null;
    if (user && checkTokenValid()) return null;

    return <WrappedComponent {...props} />;
  }

  GuestGuard.displayName = `withGuest(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return GuestGuard;
}

// ─── Hook tiện ích ────────────────────────────────────────────────────────────

/**
 * Hook kiểm tra trạng thái xác thực hiện tại.
 * @returns {{ isAuthenticated: boolean, isLoading: boolean, user: object|null }}
 */
export function useAuth() {
  const { user, isLoading } = useContext(AppContext);
  return {
    isAuthenticated: !!user && checkTokenValid(),
    isLoading,
    user,
  };
}
