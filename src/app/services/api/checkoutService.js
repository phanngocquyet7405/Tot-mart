export const checkoutService = {
  createOrder: (payload) =>
    axiosConfig.post(API_ENDPOINTS.CHECKOUT.CREATE, payload),
};
