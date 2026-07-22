"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { fetchDashboardStats } from "../services/dashboardAdminService";

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Không thể tải thống kê. Vui lòng thử lại.");
      toast.error("Không thể tải thống kê dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}
