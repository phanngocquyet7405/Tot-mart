"use client";

import { useEffect, useState } from "react";
import { getAllBoxesApi } from "@/app/services/api/boxService";
import { normalizeBoxes } from "../utils/normalizeBoxes";

export function useBoxes() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      const res = await getAllBoxesApi();
      setBoxes(normalizeBoxes(res));
    } catch (e) {
      console.log(e);
      setError("Không thể tải danh sách hộp");
    } finally {
      setLoading(false);
    }
  };

  return {
    boxes,
    loading,
    error,
    refetch: fetchBoxes,
  };
}
