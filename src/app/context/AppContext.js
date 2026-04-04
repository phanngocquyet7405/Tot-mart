'use client';

import { createContext, useState, useEffect, useCallback } from "react";
import {axiosConfig} from "@/app/util/axiosConfig";
// import { API_ENDPOINTS } from "../api/apiEndpoint"; 

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
            const response = await axiosConfig.get(API_ENDPOINTS.AUTH.PROFILE); 
            setUser(response || response.user || response.data);
        } catch (error) {
            console.error("auth error:", error);
            localStorage.removeItem("token");
            setUser(null);
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
        refreshUser: fetchUserProfile
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};