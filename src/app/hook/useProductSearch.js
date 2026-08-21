"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllProductsApi } from "@/app/services/api/productServices";

const MAX_SUGGESTIONS = 6;

// Bỏ dấu tiếng Việt để so khớp không phân biệt dấu (vd "ao" khớp "áo")
// Export để ProductsGrid dùng chung khi lọc theo ?search= trên trang kết quả.
export function normalizeSearchText(str = "") {
  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Tìm kiếm sản phẩm — TẠM THỜI lọc phía client vì BE chưa hỗ trợ query
 * `search` (xem TODO trong apiEndpoints.js — PRODUCTS.GET_ALL). Fetch toàn
 * bộ sản phẩm 1 lần khi mount, sau đó lọc lại mỗi khi `query` đổi.
 *
 * Khi BE làm xong `search` param: xoá bước fetch-toàn-bộ ở đây, thay bằng
 * gọi trực tiếp `getAllProductsApi({ search: query, limit: 6 })` mỗi khi
 * query đổi (debounce ở phía gọi, giống cấu trúc hook này) — SearchBar.js
 * dùng hook này không cần đổi gì cả, chỉ đổi bên trong hook.
 */
export function useProductSearch(query) {
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getAllProductsApi();
        const data = res?.data?.data ?? res?.data ?? [];
        if (!cancelled && Array.isArray(data)) {
          setAllProducts(data);
        }
      } catch {
        // Gợi ý tìm kiếm là tính năng phụ — lỗi ở đây không nên làm vỡ UI,
        // chỉ đơn giản là không có gợi ý.
      } finally {
        if (!cancelled) setIsLoadingAll(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const q = normalizeSearchText(query?.trim());
    if (!q) return [];

    return allProducts
      .filter((p) => p.isActive !== false)
      .filter((p) => normalizeSearchText(p.name).includes(q))
      .slice(0, MAX_SUGGESTIONS);
  }, [allProducts, query]);

  return { results, isLoadingAll };
}
