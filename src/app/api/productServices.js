import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

// --- DANH MỤC (CATEGORIES) ---
export const getAllCategoriesApi = () => {
    return axiosConfig.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
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

export const createProductApi = (data) => {
    return axiosConfig.post(API_ENDPOINTS.PRODUCTS.CREATE, data);
};

export const getAllProductsApi = () => {
    return axiosConfig.get("/products/get-all-products");
};