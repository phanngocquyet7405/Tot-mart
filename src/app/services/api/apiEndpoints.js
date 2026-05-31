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
    GET_ME: "/users/me",
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

  CART: {
    GET_ALL: "/carts/get-all-cart",
    GET_BY_USER: (id) => `/carts/get-cart/${id}`,
    ADD: "/carts/add-to-cart",
    UPDATE: (id) => `/carts/update-cart/${id}`,
    DELETE: (id) => `/carts/delete-from-cart/${id}`,

    SUBSCRIBE: {
      ADD: "/carts/add-subcribe-plan-to-cart",
      UPDATE: "/carts/update-subcribe-cart",
      DELETE: (id) => `/carts/delete-from-subcribe-cart/${id}`,
      GET_BY_USER: (id) => `/carts/get-subcribe-cart/${id}`,
    },
  },

  CHECKOUT: {
    CREATE: "/checkout",
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
    GET_ALL: "/boxes/get-all-box",
    GET_BY_ID: (id) => `/boxes/get-box-by-id/${id}`,
    GET_PRODUCTS: (id) => `/boxes/get-products-in-box/${id}`,
    GET_OFFERS: "/boxes/get-box-offer-discount-coupons",
    CREATE: "/boxes/create-box",
    UPDATE: (id) => `/boxes/update-box/${id}`,
    DELETE: (id) => `/boxes/delete-box/${id}`,
  },

  SUBSCRIBE_PLANS: {
    CREATE: "/subcribe-plans/create-subcribe-plan",
    GET_ALL: "/subcribe-plans/get-all-subcribe-plans",
    GET_BY_ID: (id) => `/subcribe-plans/${id}`,
    GET_BY_USER: (userId) => `/subcribe-plans/user/${userId}`,
    CANCEL: (id) => `/subcribe-plans/${id}/cancel`,
    CANCEL_IMMEDIATELY: (id) => `/subcribe-plans/${id}/cancel-immediately`,
    PROCESS_DELIVERIES: "/subcribe-plans/process-deliveries",
  },
};
