"use client";

import { useLayoutEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AppContext } from "@/app/context/AppContext";
import { checkTokenValid, getTokenRole } from "./tokenMiddleware";

// Helper để kiểm tra quyền nhanh (dùng trong logic render)
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

    useLayoutEffect(() => {
      if (isLoading) return;

      const tokenValid = checkTokenValid();
      if (!tokenValid) {
        router.replace("/login?session=expired");
        return;
      }

      if (user && user.role !== "admin") {
        router.replace("/homepage?error=forbidden");
      }
    }, [user, isLoading, router]);

    // Đang load → spinner (hợp lý vì chưa biết role)
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    // FIX: Trả null thay vì spinner khi đang redirect
    // Spinner cũ render rồi mới redirect → gây flash spinner → flash trắng → trang mới
    // Null render không có gì → redirect ngay → không flash
    if (!user || !checkTokenValid() || user.role !== "admin") {
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  AdminGuard.displayName = `withAdmin(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return AdminGuard;
}

// ─── withRole ────────────────────────────────────────────────────────────────
export function withRole(WrappedComponent, allowedRoles = [], options = {}) {
  const { redirectTo = "/homepage" } = options;

  function RoleGuard(props) {
    const router = useRouter();
    const { user, isLoading } = useContext(AppContext);

    useLayoutEffect(() => {
      if (isLoading) return;

      const tokenValid = checkTokenValid();
      if (!tokenValid) {
        router.replace("/login?session=expired");
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        router.replace(`${redirectTo}?error=forbidden`);
      }
      // allowedRoles và redirectTo không cần trong dep array vì chúng là
      // giá trị cố định từ factory function, không thay đổi theo lifecycle
    }, [user, isLoading, router]);

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
