import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

// --- DANH MỤC (CATEGORIES) ---
export const getAllCategoriesApi = () =>
  axiosConfig.get(API_ENDPOINTS.CATEGORIES.GET_ALL);

export const getRootCategoriesApi = () =>
  axiosConfig.get(API_ENDPOINTS.CATEGORIES.GET_ROOT);

export const getCategoryByIdApi = (id) =>
  axiosConfig.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));

export const getProductsByCategoryApi = (id) =>
  axiosConfig.get(API_ENDPOINTS.CATEGORIES.GET_PRODUCTS(id));

export const createCategoryApi = (data) =>
  axiosConfig.post(API_ENDPOINTS.CATEGORIES.CREATE, data);

export const updateCategoryApi = (id, data) =>
  axiosConfig.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), data);

export const deleteCategoryApi = (id) =>
  axiosConfig.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));

// --- THƯƠNG HIỆU (BRANDS) ---
// create-brand / update-brand giờ nhận multipart/form-data vì backend dùng
// multer + Cloudinary để lưu logo (xem brandLogoUpload.js, brandController.js).
// Body JSON thuần với field "logo" dạng URL sẽ bị Joi (logo: forbidden()) từ chối.
export const getAllBrandsApi = () =>
  axiosConfig.get(API_ENDPOINTS.BRANDS.GET_ALL);

export const createBrandApi = (formData) =>
  axiosConfig.post(API_ENDPOINTS.BRANDS.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateBrandApi = (id, formData) =>
  axiosConfig.put(API_ENDPOINTS.BRANDS.UPDATE(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBrandApi = (id) =>
  axiosConfig.delete(API_ENDPOINTS.BRANDS.DELETE(id));

// --- SẢN PHẨM (PRODUCTS) ---
export const createProductApi = (formData) =>
  axiosConfig.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// BE phân trang danh sách sản phẩm (mặc định 10/trang, tối đa 100). Nhiều màn
// hình (trang chủ, danh mục, thương hiệu, giỏ hàng, menu, dashboard, form box…)
// gọi getAllProductsApi() không tham số và cần TOÀN BỘ sản phẩm, nên khi không có
// params hàm này gom đủ mọi trang.
const PRODUCTS_PAGE_SIZE = 100;

/** Đúng một trang: params = { page, limit, keyword, category, brand, sort… } */
export const getProductsPageApi = (params = {}) =>
  axiosConfig.get(API_ENDPOINTS.PRODUCTS.GET_ALL, { params });

let allProductsInflight = null;

async function fetchEveryProductPage() {
  const first = await getProductsPageApi({ page: 1, limit: PRODUCTS_PAGE_SIZE });
  const totalPages = first?.pagination?.totalPages ?? 1;
  if (totalPages <= 1) return first;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      getProductsPageApi({ page: i + 2, limit: PRODUCTS_PAGE_SIZE }),
    ),
  );
  const data = [first, ...rest].flatMap((r) => (Array.isArray(r?.data) ? r.data : []));
  return {
    ...first,
    data,
    pagination: { ...first.pagination, page: 1, limit: data.length, totalPages: 1 },
  };
}

/**
 * - Có params (page/limit/keyword/…) → đúng một request theo tham số.
 * - Không có params → toàn bộ sản phẩm. Các lời gọi đồng thời dùng chung một
 *   lượt tải; mỗi nơi nhận bản sao riêng của mảng data.
 */
export const getAllProductsApi = async (params = {}) => {
  if (params && Object.keys(params).length > 0) return getProductsPageApi(params);
  if (!allProductsInflight) {
    allProductsInflight = fetchEveryProductPage().finally(() => {
      allProductsInflight = null;
    });
  }
  const res = await allProductsInflight;
  return { ...res, data: Array.isArray(res?.data) ? [...res.data] : res?.data };
};

export const getProductByIdApi = (id) =>
  axiosConfig.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));

export const updateProductApi = (id, formData) =>
  axiosConfig.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProductApi = (id) =>
  axiosConfig.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));

// --- GIỎ HÀNG (CART) ---
export const getCartByUserApi = (userId) =>
  axiosConfig.get(API_ENDPOINTS.CART.GET_BY_USER(userId));

export const addToCartApi = (data) =>
  axiosConfig.post(API_ENDPOINTS.CART.ADD, data);

// Thay thế toàn bộ giỏ sản phẩm trên BE bằng giỏ localStorage — gọi trước checkout.
// items: [{ productId, quantity }]
export const syncCartApi = (items, version) =>
  axiosConfig.put(API_ENDPOINTS.CART.SYNC, { items, ...(version !== undefined ? { version } : {}) });

export const updateCartItemApi = (cartId, data) =>
  axiosConfig.put(API_ENDPOINTS.CART.UPDATE(cartId), data);

export const deleteFromCartApi = (cartId, data) =>
  axiosConfig.delete(API_ENDPOINTS.CART.DELETE(cartId), { data });

// --- GIỎ HÀNG ĐĂNG KÝ (SUBSCRIBE CART) ---
export const getSubscribeCartByUserApi = (userId) =>
  axiosConfig.get(API_ENDPOINTS.CART.SUBSCRIBE.GET_BY_USER(userId));

export const addSubscribePlanToCartApi = (data) =>
  axiosConfig.post(API_ENDPOINTS.CART.SUBSCRIBE.ADD, data);

export const updateSubscribeCartApi = (data) =>
  axiosConfig.put(API_ENDPOINTS.CART.SUBSCRIBE.UPDATE, data);

export const deleteFromSubscribeCartApi = (id, data) =>
  axiosConfig.delete(API_ENDPOINTS.CART.SUBSCRIBE.DELETE(id), { data });
