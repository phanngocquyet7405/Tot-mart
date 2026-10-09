"use client";
import { toast } from 'sonner';
import { createContext, useState, useEffect, useCallback } from 'react';
import { axiosConfig } from '../services/api/axiosConfig';
import { saveSessionUser, clearSession } from '../middleware/tokenMiddleware';
export const AppContext = createContext();
export const AppContextProvider = ({ children }) => {
  const [user, setUserState] = useState(null), [isLoading, setIsLoading] = useState(true);
  const setUser = useCallback(value => { setUserState(value); saveSessionUser(value); }, []);
  const fetchUserProfile = useCallback(async () => {
    try { const response = await axiosConfig.get('/users/me'); const profile = response.data; setUser(profile); return profile; }
    catch { setUser(null); return null; }
    finally { setIsLoading(false); }
  }, [setUser]);
  useEffect(() => { void fetchUserProfile(); }, [fetchUserProfile]);
  const logout = useCallback(async () => {
    try { await axiosConfig.post('/home/logout'); }
    catch { toast.error("Không đăng xuất được. Vui lòng thử lại khi có kết nối."); return false; } // Never claim a server-side logout succeeded when it failed.
    clearSession(); setUser(null); window.location.href = '/login'; return true;
  }, [setUser]);
  return <AppContext.Provider value={{ user, setUser, isLoading, logout, refreshUser: fetchUserProfile }}>{children}</AppContext.Provider>;
};
