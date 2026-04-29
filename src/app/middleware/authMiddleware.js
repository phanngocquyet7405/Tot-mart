"use client";

import { useLayoutEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AppContext } from "@/app/context/AppContext";
import { checkTokenValid } from "./tokenMiddleware";

export function withAuth(WrappedComponent, options = {}) {
  const { redirectTo = "/login" } = options;

  function AuthGuard(props) {
    const router = useRouter();
    const { user, isLoading } = useContext(AppContext);

    // ── DEBUG: trace mỗi lần AuthGuard render ──────────────────────────────
    console.log(
      "DEBUG [withAuth] render —",
      "isLoading:",
      isLoading,
      "| user:",
      user,
      "| checkTokenValid:",
      checkTokenValid(),
    );

    useLayoutEffect(() => {
      console.log(
        "DEBUG [withAuth] useLayoutEffect fired —",
        "isLoading:",
        isLoading,
        "| user:",
        user,
      );

      if (isLoading) {
        console.log("DEBUG [withAuth] → đang loading, bỏ qua");
        return;
      }

      const tokenOk = checkTokenValid();
      console.log("DEBUG [withAuth] tokenOk:", tokenOk, "| user:", !!user);

      if (!user || !tokenOk) {
        console.warn(
          "DEBUG [withAuth] → REDIRECT vì",
          !user ? "user null" : "token invalid",
          "→",
          `${redirectTo}?session=expired`,
        );
        router.replace(`${redirectTo}?session=expired`);
      } else {
        console.log("DEBUG [withAuth] → OK, render component");
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      console.log("DEBUG [withAuth] render null (isLoading)");
      return null;
    }

    if (!user || !checkTokenValid()) {
      console.log("DEBUG [withAuth] render null (no user/token)");
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  AuthGuard.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return AuthGuard;
}

export function withGuest(WrappedComponent) {
  function GuestGuard(props) {
    const router = useRouter();
    const { user, isLoading } = useContext(AppContext);

    useLayoutEffect(() => {
      if (isLoading) return;

      if (user && checkTokenValid()) {
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

export function useAuth() {
  const { user, isLoading } = useContext(AppContext);
  return {
    isAuthenticated: !!user && checkTokenValid(),
    isLoading,
    user,
  };
}
