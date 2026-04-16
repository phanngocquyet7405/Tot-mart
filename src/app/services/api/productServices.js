import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

//Categories

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

//brand

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

//Product

export const createProductApi = (formData) => {
  return axiosConfig.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// GET ALL
export const getAllProductsApi = () => {
  return axiosConfig.get(API_ENDPOINTS.PRODUCTS.GET_ALL);
};

// UPDATE (multipart)
export const updateProductApi = (id, formData) => {
  return axiosConfig.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// DELETE
export const deleteProductApi = (id) => {
  return axiosConfig.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
};
