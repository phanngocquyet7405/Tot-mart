export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://totmartapi.onrender.com/api";

export const API_ENDPOINTS = {
  AUTH: {
    HEALTH: "/home/health",
    LOGIN: "/home/login",
    LOGOUT: "/home/logout",
  },

  USERS: {
    REGISTER: "/users/register",
    GET_ALL: "/users/get-all-users",
    GET_BY_ID: (id) => `/users/get-user-by-id/${id}`,
    UPDATE: (id) => `/users/update-user/${id}`,
    LOCK: (id) => `/users/lock-user/${id}`,
    UNLOCK: (id) => `/users/unlock-user/${id}`,
    DELETE: (id) => `/users/delete-user/${id}`,
    ADDRESS: {
      ADD: (id) => `/users/update-address/${id}`,
      EDIT: (userId, addressId) => `/users/edit-address/${userId}/${addressId}`,
      DELETE: (userId, addressId) =>
        `/users/delete-address/${userId}/${addressId}`,
    },
  },

  PRODUCTS: {
    CREATE: "/products/create-product",
    GET_ALL: "/products/get-all-products",
    GET_BY_ID: (id) => `/products/get-products-by-id/${id}`,
    UPDATE: (id) => `/products/update-product/${id}`,
    DELETE: (id) => `/products/delete-product/${id}`,
  },

  BRANDS: {
    CREATE: "/brands/create-brand",
    GET_ALL: "/brands/get-all-brands",
    UPDATE: (id) => `/brands/update-brand/${id}`,
    DELETE: (id) => `/brands/delete-brand/${id}`,
  },

  CATEGORIES: {
    CREATE: "/categories/create-category",
    GET_ALL: "/categories/get-all-categories",
    GET_BY_ID: (id) => `/categories/get-category-by-id/${id}`,
    GET_PRODUCTS: (id) => `/categories/get-products-by-category/${id}`,
    GET_ROOT: "/categories/get-root-categories",
    UPDATE: (id) => `/categories/update-category/${id}`,
    DELETE: (id) => `/categories/delete-category/${id}`,
  },

  BOXES: {
    CREATE: "/boxes/create-box",
    GET_ALL: "/boxes/get-all-box",
  },
};
