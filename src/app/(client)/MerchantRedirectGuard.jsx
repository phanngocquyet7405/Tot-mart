"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppContext } from "@/app/context/AppContext";

export default function MerchantRedirectGuard() {
  const { user, isLoading } = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role === "merchant") {
      router.replace("/manager");
    }
  }, [user, isLoading, router]);

  return null;
}
