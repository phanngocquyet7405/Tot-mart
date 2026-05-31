import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const getAllBoxesApi = () => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_ALL);
};

export const getBoxByIdApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_BY_ID(id));
};

export const getProductsInBoxApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_PRODUCTS(id));
};

export const getBoxOffersApi = () => {
  return axiosConfig.get(API_ENDPOINTS.BOXES.GET_OFFERS);
};

export const createBoxApi = (formData) => {
  return axiosConfig.post(API_ENDPOINTS.BOXES.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateBoxApi = (id, formData) => {
  return axiosConfig.put(API_ENDPOINTS.BOXES.UPDATE(id), formData);
};

export const deleteBoxApi = (id) => {
  return axiosConfig.delete(API_ENDPOINTS.BOXES.DELETE(id));
};
