"use client";
import { createContext, useState, useEffect, useCallback } from "react";

// Import từ tokenMiddleware thay vì tự xử lý
import {
  getDecodedToken,
  checkTokenValid,
  handleExpiredToken,
} from "../middleware/tokenMiddleware";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * fetchUserProfile - đọc token từ storage, decode và cập nhật state.
   *
   * Thay đổi so với bản cũ:
   *  - Dùng getDecodedToken() và checkTokenValid() từ tokenMiddleware
   *    (không tự jwtDecode + kiểm tra exp nữa → tránh trùng lặp logic)
   *  - Luôn return userData hoặc null (page.js dùng giá trị trả về)
   *  - Gọi handleExpiredToken() khi token hết hạn → nhất quán với axiosMiddleware
   *    (cả hai đều redirect /login?session=expired thay vì /login)
   */
  const fetchUserProfile = useCallback(() => {
    // checkTokenValid() bao gồm: kiểm tra tồn tại + decode + kiểm tra exp
    const tokenOk = checkTokenValid();

    if (!tokenOk) {
      // Nếu có token nhưng đã hết hạn → cleanup + redirect
      const decoded = getDecodedToken();
      if (decoded) {
        // Token tồn tại nhưng hỏng/hết hạn
        handleExpiredToken();
      }
      // Không có token → chỉ reset state, không redirect (user chưa từng login)
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const decoded = getDecodedToken();

      // Mapping từ JWT payload của BE:
      // jwt.sign({ userId, name, email, role, avatar }, ...)
      const userData = {
        _id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        avatar: decoded.avatar ?? null, // BE có avatar trong payload
      };

      setUser(userData);
      return userData; // ← Quan trọng: page.js dùng giá trị này để lấy role
    } catch (error) {
      console.error("Lỗi xác thực Token:", error);
      handleExpiredToken(); // Dùng handleExpiredToken thay vì logout để nhất quán
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  /**
   * logout - đăng xuất thủ công (user bấm nút Logout).
   *
   * Khác handleExpiredToken (tự động khi token hết hạn):
   *  - logout()            → redirect /login (bình thường)
   *  - handleExpiredToken() → redirect /login?session=expired (thông báo hết phiên)
   */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  const contextValue = {
    user,
    setUser,
    isLoading,
    logout,
    refreshUser: fetchUserProfile,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
