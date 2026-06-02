"use client";
import { createContext, useState, useEffect, useCallback } from "react";
import {
  getDecodedToken,
  checkTokenValid,
  handleExpiredToken,
} from "../middleware/tokenMiddleware";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(() => {
    const tokenOk = checkTokenValid();

    if (!tokenOk) {
      const decoded = getDecodedToken();
      if (decoded) {
        handleExpiredToken();
      }
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const decoded = getDecodedToken();

      // FIX: Không ép cứng .userId mà tìm ID linh hoạt
      const userId = decoded._id || decoded.id || decoded.userId;

      const userData = {
        _id: userId, // Đảm bảo luôn có giá trị đúng để dùng trong profile page
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        avatar: decoded.avatar ?? null,
      };

      console.log("DEBUG [AppContext] UserData được nạp:", userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Lỗi xác thực Token trong Context:", error);
      handleExpiredToken();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    // Xóa cả 2 nơi vì saveToken có thể lưu vào sessionStorage (khi không rememberMe)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
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
