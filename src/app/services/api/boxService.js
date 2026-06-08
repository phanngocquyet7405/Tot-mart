import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const getAllBoxesApi = () =>
  axiosConfig.get(API_ENDPOINTS.BOXES.GET_ALL);

export const getBoxByIdApi = (id) =>
  axiosConfig.get(API_ENDPOINTS.BOXES.GET_BY_ID(id));

export const getProductsInBoxApi = (id) =>
  axiosConfig.get(API_ENDPOINTS.BOXES.GET_PRODUCTS(id));

export const getBoxOffersApi = () =>
  axiosConfig.get(API_ENDPOINTS.BOXES.GET_OFFERS);

export const createBoxApi = (formData) =>
  axiosConfig.post(API_ENDPOINTS.BOXES.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateBoxApi = (id, formData) =>
  axiosConfig.put(API_ENDPOINTS.BOXES.UPDATE(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBoxApi = (id) =>
  axiosConfig.delete(API_ENDPOINTS.BOXES.DELETE(id));
