import { userService } from "@/app/services/api/userService";

// NOTE: getAllUsers hiện nhận (page, limit) nhưng UserTable luôn gọi không
// tham số -> mặc định page=1, limit=10, nghĩa là bảng chỉ hiển thị tối đa
// 10 user đầu tiên, không có phân trang thật. Giữ nguyên hành vi cũ, cần bổ
// sung UI phân trang + truyền page/limit nếu muốn xem hết danh sách.
export async function fetchAdminUsers() {
  const response = await userService.getAllUsers();
  const data = response.data || response || [];
  return Array.isArray(data) ? data : [];
}

export async function lockAdminUser(id) {
  return userService.lockUser(id);
}

export async function unlockAdminUser(id) {
  return userService.unlockUser(id);
}

export async function deleteAdminUser(id) {
  return userService.deleteUser(id);
}
