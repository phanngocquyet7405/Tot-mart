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

    useLayoutEffect(() => {
      if (isLoading) return;
      if (!user || !checkTokenValid()) {
        router.replace(`${redirectTo}?session=expired`);
      }
    }, [user, isLoading, router]);

    if (isLoading) return null;
    if (!user || !checkTokenValid()) return null;

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
