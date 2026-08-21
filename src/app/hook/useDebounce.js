"use client";

import { useState, useEffect } from "react";

/**
 * Debounce một giá trị — chỉ trả về giá trị mới sau khi nó "đứng yên"
 * trong `delay`ms. Dùng cho ô tìm kiếm để tránh gọi API mỗi lần gõ phím.
 *
 * Ví dụ:
 *   const [query, setQuery] = useState("");
 *   const debouncedQuery = useDebounce(query, 400);
 *   useEffect(() => { if (debouncedQuery) fetchResults(debouncedQuery); }, [debouncedQuery]);
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
