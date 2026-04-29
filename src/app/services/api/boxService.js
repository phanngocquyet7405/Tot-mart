import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

// ✅ GET /box — lấy tất cả box
export const getAllBoxesApi = () => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_ALL);
};

// ✅ GET /box/:id — lấy box theo ID
export const getBoxByIdApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_BY_ID(id));
};

// ✅ GET /box/:id/products — sản phẩm trong box
export const getProductsInBoxApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_PRODUCTS(id));
};

// ✅ GET /box/offers — discount + new + gift boxes
export const getBoxOffersApi = () => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_OFFERS);
};

// ✅ POST /box — tạo box mới (multipart/form-data)
export const createBoxApi = (formData) => {
  return axiosConfig.post(API_ENDPOINTS.BOXES.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ PATCH /box/:id — cập nhật box (multipart/form-data)
export const updateBoxApi = (id, formData) => {
  return axiosConfig.patch(API_ENDPOINTS.BOXES.UPDATE(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ DELETE /box/:id — xóa box
export const deleteBoxApi = (id) => {
  return axiosConfig.delete(API_ENDPOINTS.BOXES.DELETE(id));
};
