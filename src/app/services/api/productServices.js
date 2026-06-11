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
export const getAllBrandsApi = () =>
  axiosConfig.get(API_ENDPOINTS.BRANDS.GET_ALL);

export const createBrandApi = (data) =>
  axiosConfig.post(API_ENDPOINTS.BRANDS.CREATE, data);

export const updateBrandApi = (id, data) =>
  axiosConfig.put(API_ENDPOINTS.BRANDS.UPDATE(id), data);

export const deleteBrandApi = (id) =>
  axiosConfig.delete(API_ENDPOINTS.BRANDS.DELETE(id));

// --- SẢN PHẨM (PRODUCTS) ---
export const createProductApi = (formData) =>
  axiosConfig.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getAllProductsApi = () =>
  axiosConfig.get(API_ENDPOINTS.PRODUCTS.GET_ALL);

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
