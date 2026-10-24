import {
  getServerProducts,
  getServerCategories,
  getServerBrands,
  getServerBoxes,
  getPublicSiteUrl,
  getLastKnownGoodSitemap,
  saveLastKnownGoodSitemap,
} from "@/app/services/server/serverCatalog";

export const revalidate = 3600;

// Trang tĩnh — cập nhật thủ công khi thêm route mới không thuộc dạng động
const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/subscription", priority: 0.9, changeFrequency: "daily" },
  { path: "/box", priority: 0.9, changeFrequency: "daily" },
  { path: "/gift", priority: 0.9, changeFrequency: "daily" },
  { path: "/homepage", priority: 1, changeFrequency: "daily" },
  { path: "/products", priority: 0.9, changeFrequency: "daily" },
  { path: "/categories", priority: 0.8, changeFrequency: "weekly" },
  { path: "/brands", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pages/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/pages/contact-us", priority: 0.5, changeFrequency: "monthly" },
  { path: "/pages/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/pages/news", priority: 0.6, changeFrequency: "weekly" },
  { path: "/pages/offers-discounts-coupons", priority: 0.6, changeFrequency: "weekly" },
];

export default async function sitemap() {
  const SITE_URL = getPublicSiteUrl();

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  try {
    const [products, categories, brands, boxes] = await Promise.all([
      getServerProducts(),
      getServerCategories(),
      getServerBrands(),
      getServerBoxes(),
    ]);

    const productEntries = products
      .filter((p) => p && p.isActive !== false && !p.archivedAt)
      .map((p) => ({
        url: `${SITE_URL}/products/${p.slug || "san-pham"}-${p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    const categoryEntries = categories
      .filter((c) => c && c.isActive !== false)
      .map((c) => ({
        url: `${SITE_URL}/categories/${c.slug || c._id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      }));

    const brandEntries = brands
      .filter((b) => b && b.isActive !== false)
      .map((b) => ({
        url: `${SITE_URL}/brands/${b.slug || b._id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      }));

    const boxEntries = boxes
      .filter((box) => box && box.isActive !== false && !box.archivedAt)
      .map((box) => ({
        url: `${SITE_URL}/products/box/${box._id}`,
        lastModified: box.updatedAt ? new Date(box.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      }));

    const dynamicEntries = [
      ...productEntries,
      ...categoryEntries,
      ...brandEntries,
      ...boxEntries,
    ];

    if (dynamicEntries.length > 0) {
      saveLastKnownGoodSitemap(dynamicEntries);
    }

    return [...staticEntries, ...dynamicEntries];
  } catch (err) {
    // Fail-closed mặc định ở mọi môi trường; chỉ cho phép dự phòng khi có biến bật rõ ràng cho CI test
    if (process.env.ALLOW_SITEMAP_FALLBACK === "true") {
      console.warn(
        `[Sitemap Fallback Permitted] Backend fetch failed (${err.message}). Using last-known-good cache.`,
      );
      const cachedDynamic = getLastKnownGoodSitemap();
      if (cachedDynamic && cachedDynamic.length > 0) {
        return [...staticEntries, ...cachedDynamic];
      }
      return staticEntries;
    }

    console.error(
      `[Sitemap Error] Backend catalog fetch failed: ${err.message}. Fail-closed active (ALLOW_SITEMAP_FALLBACK is not enabled).`,
    );
    throw err;
  }
}
