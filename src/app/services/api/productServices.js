import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

// --- DANH MỤC (CATEGORIES) ---
export const getAllCategoriesApi = () => {
  return axiosConfig.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
};

export const getRootCategoriesApi = () => {
  return axiosConfig.get(API_ENDPOINTS.CATEGORIES.GET_ROOT);
};

export const getCategoryByIdApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
};

export const getProductsByCategoryApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.CATEGORIES.GET_PRODUCTS(id));
};

export const createCategoryApi = (data) => {
  return axiosConfig.post(API_ENDPOINTS.CATEGORIES.CREATE, data);
};

export const updateCategoryApi = (id, data) => {
  return axiosConfig.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), data);
};

export const deleteCategoryApi = (id) => {
  return axiosConfig.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
};

// --- THƯƠNG HIỆU (BRANDS) ---
export const getAllBrandsApi = () => {
  return axiosConfig.get(API_ENDPOINTS.BRANDS.GET_ALL);
};

export const createBrandApi = (data) => {
  return axiosConfig.post(API_ENDPOINTS.BRANDS.CREATE, data);
};

export const updateBrandApi = (id, data) => {
  return axiosConfig.put(API_ENDPOINTS.BRANDS.UPDATE(id), data);
};

export const deleteBrandApi = (id) => {
  return axiosConfig.delete(API_ENDPOINTS.BRANDS.DELETE(id));
};

// --- SẢN PHẨM (PRODUCTS) ---
export const createProductApi = (formData) => {
  return axiosConfig.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getAllProductsApi = () => {
  return axiosConfig.get(API_ENDPOINTS.PRODUCTS.GET_ALL);
};

export const getProductByIdApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
};

export const updateProductApi = (id, formData) => {
  return axiosConfig.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProductApi = (id) => {
  return axiosConfig.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
};

export const createBoxApi = (formData) => {
  return axiosConfig.post(API_ENDPOINTS.BOXES.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getAllBoxesApi = () => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_ALL);
};

// --- GIỎ HÀNG (CART) ---
// ==========================================
export const getCartByUserApi = (userId) => {
  return axiosConfig.get(API_ENDPOINTS.CART.GET_BY_USER(userId));
};

export const addToCartApi = (data) => {
  return axiosConfig.post(API_ENDPOINTS.CART.ADD, data);
};

export const updateCartItemApi = (cartId, data) => {
  return axiosConfig.put(API_ENDPOINTS.CART.UPDATE(cartId), data);
};

export const deleteFromCartApi = (cartId, data) => {
  // Axios delete gửi dữ liệu trong body thì phải bọc qua config `data`
  return axiosConfig.delete(API_ENDPOINTS.CART.DELETE(cartId), { data });
};

// --- GIỎ HÀNG ĐĂNG KÝ (SUBSCRIBE CART) ---
export const getSubscribeCartByUserApi = (userId) => {
  return axiosConfig.get(API_ENDPOINTS.CART.SUBSCRIBE.GET_BY_USER(userId));
};

export const addSubscribePlanToCartApi = (data) => {
  return axiosConfig.post(API_ENDPOINTS.CART.SUBSCRIBE.ADD, data);
};

export const updateSubscribeCartApi = (data) => {
  return axiosConfig.put(API_ENDPOINTS.CART.SUBSCRIBE.UPDATE, data);
};

export const deleteFromSubscribeCartApi = (id, data) => {
  return axiosConfig.delete(API_ENDPOINTS.CART.SUBSCRIBE.DELETE(id), { data });
};
