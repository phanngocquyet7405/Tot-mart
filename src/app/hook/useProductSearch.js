"use client";
import { useState, useEffect } from 'react';
import { getAllProductsApi } from '@/app/services/api/productServices';
export function normalizeSearchText(value = '') { return value.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd'); }
export function useProductSearch(query) {
  const [results, setResults] = useState([]), [isLoadingAll, setLoading] = useState(false);
  useEffect(() => {
    const value = query?.trim(); let active = true;
    if (!value) { setResults([]); setLoading(false); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try { const response = await getAllProductsApi({ keyword: value, limit: 6 }); if (active) setResults(response.data || []); }
      catch { if (active) setResults([]); }
      finally { if (active) setLoading(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);
  return { results, isLoadingAll };
}
