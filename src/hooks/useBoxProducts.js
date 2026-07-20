import { useState, useCallback } from "react";

/**
 * useBoxProducts
 * Lazy-loads products contained within a subscription box.
 * Useful for avoiding unnecessary API calls on initial page load.
 *
 * @param {string} boxId - The ID of the box to fetch products for
 * @param {Object} options - Configuration options
 * @param {boolean} options.lazy - If true, don't fetch on mount (default: false)
 * @returns {Object} - { products, isLoading, error, hasFetched, refetch }
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

      // Fetch products from the box API
      const response = await fetch(`/api/boxes/${boxId}/products`);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      setHasFetched(true);
    } catch (err) {
      console.error("[useBoxProducts] Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [boxId]);

  // If not lazy, fetch on mount/boxId change
  if (!lazy && boxId && !hasFetched && !isLoading) {
    refetch();
  }

  return {
    products,
    isLoading,
    error,
    hasFetched,
    refetch,
  };
}
