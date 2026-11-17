/**
 * authErrors.js
 *
 * Chuẩn hóa xử lý mã lỗi xác thực và đăng nhập theo hợp đồng BE A-20261021.2.
 * - 401: Sai thông tin xác thực
 * - 403: Tài khoản bị khóa (locked) — KHÔNG BÁO SAI MẬT KHẨU
 * - 429: Vượt rate limit (quota)
 * - 400: Dữ liệu validation không hợp lệ
 * - 503: Redis / MongoDB CSOT timeout — KHÔNG BÁO SAI MẬT KHẨU, kèm requestId và nút thử lại
 * - 5xx: Lỗi hệ thống an toàn kèm requestId
 * - Network / timeout: Lỗi kết nối tạm thời
 */

export function getLoginError(err) {
  if (!err) {
    return {
      message: "Không thể thực hiện đăng nhập. Vui lòng thử lại sau.",
      isTransient: false,
    };
  }

  const status = err.response?.status;
  const data = err.response?.data;
  const requestId = data?.requestId;

  if (status === 401) {
    return {
      message: data?.message || "Email hoặc mật khẩu không chính xác.",
      requestId,
      isTransient: false,
    };
  }

  if (status === 403) {
    return {
      message: data?.message || "Tài khoản của bạn đã bị khóa hoặc tạm ngưng. Vui lòng liên hệ hỗ trợ.",
      requestId,
      isTransient: false,
    };
  }

  if (status === 429) {
    return {
      message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi trong giây lát rồi thử lại.",
      requestId,
      isTransient: true,
    };
  }

  if (status === 400) {
    return {
      message: data?.message || "Dữ liệu đăng nhập không hợp lệ.",
      requestId,
      isTransient: false,
    };
  }

  if (status === 503) {
    return {
      message: "Hệ thống đang bận hoặc gián đoạn kết nối. Vui lòng thử lại sau ít phút.",
      requestId,
      isTransient: true,
    };
  }

  if (status && status >= 500) {
    return {
      message: "Lỗi hệ thống. Vui lòng thử lại.",
      requestId,
      isTransient: true,
    };
  }

  return {
    message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền và thử lại.",
    requestId,
    isTransient: true,
  };
}
