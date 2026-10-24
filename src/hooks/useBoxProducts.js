import { useState, useCallback, useEffect } from "react";
import { getProductsInBoxApi } from "@/app/services/api/boxService";

/**
 * useBoxProducts — sản phẩm nằm trong một box (GET /boxes/get-products-in-box/:id).
 * BE trả { success, data: [{ product, quantity }] } (axios interceptor đã unwrap
 * response.data). Hook làm phẳng thành [{ ...product, quantity }].
 *
 * @param {string} boxId
 * @param {{ lazy?: boolean }} options  lazy=true: không tự tải khi mount
 */
export function useBoxProducts(boxId, options = {}) {
  const { lazy = false } = options;
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const refetch = useCallback(async () => {
    if (!boxId) {
      setProducts([]);
      setError("Box ID is required");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await getProductsInBoxApi(boxId);
      const list = Array.isArray(res?.data) ? res.data : [];
      setProducts(
        list
          .filter((item) => item?.product)
          .map((item) => ({ ...item.product, quantity: item.quantity ?? 1 })),
      );
    } catch (err) {
      console.error("[useBoxProducts] Error fetching products:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setHasFetched(true); // đã thử (kể cả lỗi) để effect của caller không lặp vô hạn
      setIsLoading(false);
    }
  }, [boxId]);

  useEffect(() => {
    if (!lazy && boxId) refetch();
  }, [lazy, boxId, refetch]);

  return { products, isLoading, error, hasFetched, refetch };
}
