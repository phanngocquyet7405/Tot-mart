import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

const EP = API_ENDPOINTS.SUBSCRIBE_PLANS;

// ============================================================
// ADMIN — Quản lý mẫu gói (Subscription Templates)
// ============================================================

/** Tạo mẫu gói mới */
export const createTemplateApi = (data) =>
  axiosConfig.post(EP.TEMPLATES.CREATE, data);

/** Lấy tất cả mẫu gói (Admin) */
export const getAllTemplatesApi = () => axiosConfig.get(EP.TEMPLATES.GET_ALL);

/** Lấy chi tiết mẫu gói theo ID (Admin) */
export const getTemplateByIdApi = (id) =>
  axiosConfig.get(EP.TEMPLATES.GET_BY_ID(id));

/** Cập nhật mẫu gói */
export const updateTemplateApi = (id, data) =>
  axiosConfig.patch(EP.TEMPLATES.UPDATE(id), data);

/** Xoá mẫu gói */
export const deleteTemplateApi = (id) =>
  axiosConfig.delete(EP.TEMPLATES.DELETE(id));

// ============================================================
// PUBLIC — Gói đang active (cho trang chọn gói của user)
// ============================================================

/** Lấy danh sách mẫu gói đang active (Public) */
export const getActiveTemplatesApi = () => axiosConfig.get(EP.GET_ACTIVE);

// ============================================================
// USER — Đăng ký & quản lý gói cá nhân (My Subscriptions)
// ============================================================

/** Đăng ký gói dịch vụ từ mẫu */
export const userSubscribeApi = (data) => axiosConfig.post(EP.SUBSCRIBE, data);

/** Lấy tất cả gói đăng ký của user hiện tại đang đăng nhập */
export const getMySubscriptionsApi = () => axiosConfig.get(EP.MY_SUBSCRIPTIONS);

/** Lấy thông tin chi tiết một gói đăng ký theo ID */
export const getMySubscriptionByIdApi = (id) =>
  axiosConfig.get(EP.MY_SUBSCRIPTION_BY_ID(id));

/** Hủy đăng ký vào cuối kỳ (Vẫn nhận hàng cho tới hết hạn chu kỳ) */
export const cancelAtEndApi = (id) => axiosConfig.patch(EP.CANCEL_AT_END(id));

/** Hủy đăng ký ngay lập tức (Dừng toàn bộ lịch giao hàng lập tức) */
export const cancelImmediatelyApi = (id) =>
  axiosConfig.patch(EP.CANCEL_IMMEDIATELY(id));

/** Lấy danh sách các đơn hàng dự kiến cần giao cho user này trong ngày hôm nay */
export const getMyTodayDeliveriesApi = () =>
  axiosConfig.get(EP.MY_TODAY_DELIVERIES);

// ============================================================
// ADMIN — Quản lý và vận hành đơn đăng ký của toàn hệ thống
// ============================================================

/** Lấy tất cả đơn đăng ký của toàn bộ user trên hệ thống (Admin dashboard) */
export const adminGetAllSubscriptionsApi = () => axiosConfig.get(EP.ADMIN_ALL);

/** Lấy danh sách các gói đăng ký thuộc về một userId cụ thể (Admin) */
export const adminGetSubscriptionsByUserApi = (userId) =>
  axiosConfig.get(EP.ADMIN_BY_USER(userId));

/** Lấy tất cả đơn hàng cần đóng gói/giao đi hôm nay của toàn bộ hệ thống (Admin) */
export const getTodayDeliveriesApi = () => axiosConfig.get(EP.TODAY_DELIVERIES);

/** Kích hoạt xử lý quét & tạo lệnh giao hàng thủ công (Admin vận hành hoặc Test) */
export const triggerDeliveryApi = () => axiosConfig.post(EP.PROCESS_DELIVERIES);

// ============================================================
// Object quy hoạch tiện dụng để import ở các Component
// ============================================================

export const templateApi = {
  getAll: getAllTemplatesApi,
  getById: getTemplateByIdApi,
  create: createTemplateApi,
  update: updateTemplateApi,
  delete: deleteTemplateApi,
};

export const subscriptionApi = {
  getActive: getActiveTemplatesApi,
  subscribe: userSubscribeApi,
  getMine: getMySubscriptionsApi,
  getMineById: getMySubscriptionByIdApi,
  cancelAtEnd: cancelAtEndApi,
  cancelImmediately: cancelImmediatelyApi,
  myTodayDeliveries: getMyTodayDeliveriesApi,
};

export const adminSubscriptionApi = {
  getAll: adminGetAllSubscriptionsApi,
  getByUser: adminGetSubscriptionsByUserApi,
  getTodayDeliveries: getTodayDeliveriesApi,
  triggerDelivery: triggerDeliveryApi,
};
