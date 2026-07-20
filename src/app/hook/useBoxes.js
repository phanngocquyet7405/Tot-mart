/**
 * useBoxes.js
 * ─────────────────────────────────────────────────────────────────
 * Fetch danh sách tất cả box (getAllBoxesApi).
 * Chuẩn hoá dữ liệu trả về qua util `normalizeBoxes` để nơi dùng
 * không cần tự xử lý các kiểu shape khác nhau từ API.
 * ─────────────────────────────────────────────────────────────────
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllBoxesApi } from "@/app/services/api/boxService";
import { normalizeBoxes } from "../utils/normalizeBoxes";
import { logger } from "@/app/util/logger";

/**
 * @param {{ lazy?: boolean }} [options] - lazy: true thì không tự fetch khi mount,
 *   phải gọi refetch() thủ công (dùng cho nơi chỉ cần load khi user tương tác).
 */
export function useBoxes({ lazy = false } = {}) {
  const [boxes, setBoxes] = useState([]);
  const [isLoading, setIsLoading] = useState(!lazy);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchBoxes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAllBoxesApi();
      setBoxes(normalizeBoxes(res));
    } catch (err) {
      logger.error(err);
      setError("Không thể tải danh sách hộp");
      setBoxes([]);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!lazy) fetchBoxes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazy]);

  return {
    boxes,
    isLoading,
    error,
    hasFetched,
    refetch: fetchBoxes,
  };
}

export default useBoxes;
