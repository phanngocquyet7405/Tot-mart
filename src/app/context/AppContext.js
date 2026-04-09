"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { axiosConfig } from "../services/api/axiosConfig";
import { API_ENDPOINTS } from "../services/api/apiEndpoints";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // SỬA TẠI ĐÂY: Tách biệt lệnh lấy data và lệnh set state
      const response = await axiosConfig.get(API_ENDPOINTS.USERS.GET_ALL);

      // Log ra để kiểm tra dữ liệu thực tế từ BE
      console.log("Dữ liệu User nhận được:", response);

      // Tùy vào cấu trúc BE trả về, thường là response.data hoặc chính response
      const userData = response.data || response;
      setUser(userData);
    } catch (error) {
      console.error("auth error:", error);

      // CHỈ xóa token khi lỗi 401 (Hết hạn).
      // Nếu lỗi 404 (Sai link) thì ĐỪNG xóa, để người dùng vẫn còn token.
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const logout = () => {
    localStorage.removeItem("token");
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
