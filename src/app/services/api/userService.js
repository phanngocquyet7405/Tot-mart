import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const userService = {
  /** Lấy danh sách người dùng (có phân trang) */
  getAllUsers: (page = 1, limit = 10) =>
    axiosConfig.get(API_ENDPOINTS.USERS.GET_ALL, {
      params: { page, limit },
    }),

  /** Lấy thông tin 1 người dùng theo ID */
  getUserById: (id) => axiosConfig.get(API_ENDPOINTS.USERS.GET_BY_ID(id)),

  /** Tạo người dùng mới (dùng cho trang admin thêm user) */
  createUser: (data) => axiosConfig.post(API_ENDPOINTS.USERS.CREATE, data),

  /** Cập nhật thông tin người dùng */
  updateUser: (id, data) =>
    axiosConfig.put(API_ENDPOINTS.USERS.UPDATE(id), data),

  /** Khóa người dùng */
  lockUser: (id) => axiosConfig.patch(API_ENDPOINTS.USERS.LOCK(id)),

  /** Mở khóa người dùng */
  unlockUser: (id) => axiosConfig.patch(API_ENDPOINTS.USERS.UNLOCK(id)),

  /** Xóa vĩnh viễn người dùng */
  deleteUser: (id) => axiosConfig.delete(API_ENDPOINTS.USERS.DELETE(id)),

  /** Thêm địa chỉ mới cho người dùng */
  addAddress: (userId, addressData) =>
    axiosConfig.post(API_ENDPOINTS.USERS.ADDRESS.ADD(userId), addressData),

  /** Sửa địa chỉ */
  editAddress: (userId, addressId, addressData) =>
    axiosConfig.put(
      API_ENDPOINTS.USERS.ADDRESS.EDIT(userId, addressId),
      addressData,
    ),

  /** Xóa địa chỉ */
  deleteAddress: (userId, addressId) =>
    axiosConfig.delete(API_ENDPOINTS.USERS.ADDRESS.DELETE(userId, addressId)),
};
