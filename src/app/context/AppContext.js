"use client";
import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Giải mã token thay vì gọi API POST /home/login
      const decoded = jwtDecode(token);

      // 2. Kiểm tra token hết hạn chưa (exp là giây)
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) {
        logout();
        return;
      }

      // 3. Mapping thông tin từ token vào state (Dựa trên Payload Backend: userId, name, email, role)
      const userData = {
        _id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Lỗi xác thực Token:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

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
