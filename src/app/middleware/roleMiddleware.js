"use client";

import { useEffect, useLayoutEffect } from "react"; // Sử dụng useLayoutEffect để chạy sớm hơn useEffect
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AppContext } from "@/app/context/AppContext";
import { checkTokenValid, getTokenRole } from "./tokenMiddleware";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function canAccess(allowedRoles) {
  const role = getTokenRole();
  const isValid = checkTokenValid();
  if (!isValid || !role) return false;
  return allowedRoles.includes(role);
}

// ─── withAdmin ────────────────────────────────────────────────────────────────
export function withAdmin(WrappedComponent) {
  function AdminGuard(props) {
    const router = useRouter();
    const { user, isLoading } = useContext(AppContext);

    // Sử dụng useLayoutEffect để thực hiện redirect nhanh nhất có thể trước khi trình duyệt vẽ giao diện
    useLayoutEffect(() => {
      const tokenValid = checkTokenValid();

      if (isLoading) return;

      // Trường hợp 1: Không có token hoặc token hết hạn
      if (!tokenValid) {
        router.replace("/login?session=expired");
        return;
      }

      // Trường hợp 2: Có token nhưng chưa có user hoặc user không phải admin
      if (user && user.role !== "admin") {
        router.replace("/homepage?error=forbidden");
      }
    }, [user, isLoading, router]);

    // QUAN TRỌNG: Không bao giờ render WrappedComponent nếu chưa thỏa mãn điều kiện
    if (isLoading || !user || !checkTokenValid() || user.role !== "admin") {
      return (
        <div className="flex h-screen items-center justify-center bg-white">
          {/* Một hiệu ứng loading nhẹ để người dùng không thấy màn hình trắng hoàn toàn */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  }

  AdminGuard.displayName = `withAdmin(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return AdminGuard;
}

// ─── withRole (Phiên bản tối ưu) ──────────────────────────────────────────────
export function withRole(WrappedComponent, allowedRoles = [], options = {}) {
  const { redirectTo = "/homepage" } = options;

  function RoleGuard(props) {
    const router = useRouter();
    const { user, isLoading } = useContext(AppContext);

    useLayoutEffect(() => {
      const tokenValid = checkTokenValid();
      if (isLoading) return;

      if (!tokenValid) {
        router.replace("/login?session=expired");
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        router.replace(`${redirectTo}?error=forbidden`);
      }
    }, [user, isLoading, router, redirectTo]);

    if (
      isLoading ||
      !user ||
      !checkTokenValid() ||
      !allowedRoles.includes(user.role)
    ) {
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  RoleGuard.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return RoleGuard;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useRoleGuard() {
  const { user, isLoading } = useContext(AppContext);
  const role = user?.role ?? null;

  return {
    role,
    isLoading,
    isAdmin: role === "admin",
    isUser: role === "user",
    hasRole: (roles) => (role ? roles.includes(role) : false),
  };
}
