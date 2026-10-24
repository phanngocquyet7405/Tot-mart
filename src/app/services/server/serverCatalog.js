import fs from "node:fs";
import path from "node:path";
import { extractProductId } from "@/app/(client)/components/Product/productDetailService";

/**
 * Server-only catalog and SEO data access module.
 * - Uses absolute backend URL from process.env.API_URL.
 * - Never leaks server backend URLs to NEXT_PUBLIC_ variables.
 * - Implements strict timeouts, host validation, response validation, and pagination.
 * - Provides last-known-good fallback caching for Sitemap generation.
 */

export function getServerApiUrl() {
  const envUrl = process.env.API_URL;
  if (envUrl && envUrl !== "undefined") {
    const trimmed = envUrl.trim().replace(/\/$/, "");
    if (!/^https?:\/\//i.test(trimmed)) {
      throw new Error(`API_URL must be an absolute http(s) URL: ${envUrl}`);
    }
    const parsed = new URL(trimmed);
    if (parsed.pathname !== "/api") {
      throw new Error(`API_URL must end with /api: ${envUrl}`);
    }
    return trimmed;
  }
  return "http://localhost:3001/api";
}

export function getPublicSiteUrl() {
  const envUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl !== "undefined") {
    const trimmed = envUrl.trim().replace(/\/$/, "");
    if (/^https?:\/\//i.test(trimmed)) {
      const parsed = new URL(trimmed);
      if (!/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/i.test(parsed.hostname)) {
        return trimmed;
      }
    }
  }
  return "https://totmart.vn";
}

export async function fetchServerJson(endpointPath, options = {}) {
  const baseUrl = getServerApiUrl();
  const cleanPath = endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`;
  const targetUrl = `${baseUrl}${cleanPath}`;
  const timeoutMs = options.timeout ?? 5000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(targetUrl, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
      next: options.next,
      cache: options.cache,
    });

    if (res.status === 404) {
      return { ok: false, status: 404, data: null };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      let errJson = null;
      try { errJson = JSON.parse(errText); } catch {}
      const error = new Error(errJson?.message || `Server request failed with status ${res.status}`);
      error.status = res.status;
      error.requestId = errJson?.requestId;
      throw error;
    }

    const json = await res.json();
    const data = json?.data !== undefined ? json.data : json;
    return { ok: true, status: res.status, data, pagination: json?.pagination };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPaginatedServer(endpointPath, queryParams = {}) {
  const qs = new URLSearchParams({ limit: "100", page: "1", ...queryParams }).toString();
  const firstPath = `${endpointPath}?${qs}`;
  const firstRes = await fetchServerJson(firstPath);
  if (!firstRes.ok || !firstRes.data) return [];

  const items = Array.isArray(firstRes.data) ? [...firstRes.data] : [];
  const totalPages = firstRes.pagination?.totalPages || 1;

  if (totalPages > 1) {
    const pagePromises = [];
    const maxPages = Math.min(totalPages, 50);
    for (let p = 2; p <= maxPages; p++) {
      const nextQs = new URLSearchParams({ limit: "100", page: String(p), ...queryParams }).toString();
      pagePromises.push(
        fetchServerJson(`${endpointPath}?${nextQs}`).then(r => (r.ok && Array.isArray(r.data) ? r.data : []))
      );
    }
    const nextPages = await Promise.all(pagePromises);
    for (const pageItems of nextPages) {
      items.push(...pageItems);
    }
  }

  return items;
}

export async function getServerProducts() {
  const items = await fetchPaginatedServer("/products/get-all-products");
  return items.filter(p => p && p.isActive !== false && !p.archivedAt);
}

export async function getServerCategories() {
  const items = await fetchPaginatedServer("/categories/get-all-categories");
  return items.filter(c => c && c.isActive !== false);
}

export async function getServerBrands() {
  const items = await fetchPaginatedServer("/brands/get-all-brands");
  return items.filter(b => b && b.isActive !== false);
}

export async function getServerBoxes() {
  const items = await fetchPaginatedServer("/boxes/get-all-box");
  return items.filter(box => box && box.isActive !== false && !box.archivedAt);
}

export async function getServerProductDetail(slugOrId) {
  if (!slugOrId) return null;
  const productId = extractProductId(slugOrId);
  try {
    const res = await fetchServerJson(`/products/get-products-by-id/${productId}`);
    if (!res.ok || !res.data) return null;
    const product = res.data;
    if (product.archivedAt || product.isActive === false) return null;
    return product;
  } catch {
    return null;
  }
}

export async function getServerBoxDetail(id) {
  if (!id) return null;
  try {
    const [detailRes, contentsRes] = await Promise.allSettled([
      fetchServerJson(`/boxes/get-box-by-id/${id}`),
      fetchServerJson(`/boxes/get-products-in-box/${id}`),
    ]);
    const box = detailRes.status === "fulfilled" && detailRes.value.ok ? detailRes.value.data : null;
    if (!box || box.archivedAt || box.isActive === false) return null;
    const boxProducts = contentsRes.status === "fulfilled" && contentsRes.value.ok && Array.isArray(contentsRes.value.data)
      ? contentsRes.value.data
      : [];
    return { box, boxProducts };
  } catch {
    return null;
  }
}

export async function getServerCategoryDetail(slugOrId) {
  if (!slugOrId) return null;
  try {
    const allCategories = await getServerCategories();
    const category = allCategories.find(c => c._id === slugOrId || c.slug === slugOrId);
    if (!category) return null;
    const productsRes = await fetchServerJson(`/categories/get-products-by-category/${category._id}`);
    const products = productsRes.ok && Array.isArray(productsRes.data) ? productsRes.data : [];
    return { category, products };
  } catch {
    return null;
  }
}

export async function getServerBrandDetail(slugOrId) {
  if (!slugOrId) return null;
  try {
    const allBrands = await getServerBrands();
    const brand = allBrands.find(b => b._id === slugOrId || b.slug === slugOrId);
    if (!brand) return null;
    const productsRes = await fetchServerJson(`/brands/get-brand-products/${brand._id}`);
    const products = productsRes.ok && Array.isArray(productsRes.data) ? productsRes.data : [];
    return { brand, products };
  } catch {
    return null;
  }
}

const LAST_KNOWN_GOOD_PATH = path.resolve(process.cwd(), ".cache/sitemap-last-known-good.json");
let inMemoryLastKnownGood = null;

export function getLastKnownGoodSitemap() {
  if (inMemoryLastKnownGood && inMemoryLastKnownGood.length > 0) {
    return inMemoryLastKnownGood;
  }
  try {
    if (fs.existsSync(LAST_KNOWN_GOOD_PATH)) {
      const raw = fs.readFileSync(LAST_KNOWN_GOOD_PATH, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryLastKnownGood = parsed;
        return parsed;
      }
    }
  } catch {
    /* Best effort cache read */
  }
  return null;
}

export function saveLastKnownGoodSitemap(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return;
  inMemoryLastKnownGood = entries;
  try {
    const dir = path.dirname(LAST_KNOWN_GOOD_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LAST_KNOWN_GOOD_PATH, JSON.stringify(entries, null, 2), "utf8");
  } catch {
    /* Best effort cache write */
  }
}
