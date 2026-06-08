export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://totmartapi.onrender.com/api";

export const API_ENDPOINTS = {
  AUTH: {
    HEALTH: "/home/health",
    LOGIN: "/home/login",
    LOGOUT: "/home/logout",
    FORGOT_PASSWORD: "/home/forgot-password",
    RESET_PASSWORD: "/home/reset-password",
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
    CREATE: "/checkout/check-out",
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
    TEMPLATES: {
      CREATE: "/subcribe-plans/create-subscription-template",
      GET_ALL: "/subcribe-plans/all-subscription-templates",
      GET_BY_ID: (id) => `/subcribe-plans/get-subscription-template/${id}`,
      UPDATE: (id) => `/subcribe-plans/update-subscription-template/${id}`,
      DELETE: (id) => `/subcribe-plans/delete-subscription-template/${id}`,
    },

    GET_ACTIVE: "/subcribe-plans/get-active-subscribe",

    SUBSCRIBE: "/subcribe-plans/user-subscribe",
    MY_SUBSCRIPTIONS: "/subcribe-plans/my-subscriptions",
    MY_SUBSCRIPTION_BY_ID: (id) => `/subcribe-plans/my-subscriptions/${id}`,
    CANCEL_AT_END: (id) =>
      `/subcribe-plans/my-subscriptions/${id}/cancel-at-end`,
    CANCEL_IMMEDIATELY: (id) =>
      `/subcribe-plans/my-subscriptions/${id}/cancel-immediately`,

    MY_TODAY_DELIVERIES: "/subcribe-plans/my-today-deliveries",

    ADMIN_ALL: "/subcribe-plans/admin-all-subscriptions",
    ADMIN_BY_USER: (userId) =>
      `/subcribe-plans/admin-subscriptions/user/${userId}`,

    PROCESS_DELIVERIES: "/subcribe-plans/process-deliveries",
    TODAY_DELIVERIES: "/subcribe-plans/today-deliveries",
  },
};
