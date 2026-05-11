import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

// ✅ GET ALL
export const getAllBoxesApi = () => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_ALL);
};

// ✅ GET BY ID
export const getBoxByIdApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_BY_ID(id));
};

// ✅ GET PRODUCTS IN BOX
export const getProductsInBoxApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_PRODUCTS(id));
};

// ✅ GET OFFERS
export const getBoxOffersApi = () => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_OFFERS);
};

// ✅ FIX ❹: Bỏ Content-Type header thủ công.
// Khi truyền FormData, browser tự set multipart/form-data + boundary chính xác.
// Set tay sẽ phá boundary → BE không parse được file upload.
export const createBoxApi = (formData) => {
  return axiosConfig.post(API_ENDPOINTS.BOXES.CREATE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateBoxApi = (id, formData) => {
  return axiosConfig.put(API_ENDPOINTS.BOXES.UPDATE(id), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteBoxApi = (id) => {
  return axiosConfig.delete(API_ENDPOINTS.BOXES.DELETE(id));
};
