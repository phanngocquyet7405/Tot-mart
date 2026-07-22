/**
 * Chuẩn hoá shape response từ axios/API — tránh lặp res.data?.data || res.data || []
 */
export function parseApiResponse(response, fallback = []) {
  if (response == null) return fallback;

  if (Array.isArray(response)) return response;

  if (typeof response !== "object") return fallback;

  const { data, brands, users, products, categories, boxes } = response;

  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data)) return data.data;
  if (Array.isArray(brands)) return brands;
  if (Array.isArray(users)) return users;
  if (Array.isArray(products)) return products;
  if (Array.isArray(categories)) return categories;
  if (Array.isArray(boxes)) return boxes;

  return fallback;
}

export function parseApiItem(response) {
  if (response == null) return null;
  if (typeof response !== "object" || Array.isArray(response)) return response;
  return response.data ?? response;
}
