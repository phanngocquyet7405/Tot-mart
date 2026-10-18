import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken, getTokenUserId, saveToken, clearSession } from './tokenMiddleware';
let refreshing = null;
export function setupAxiosMiddleware(instance) {
  instance.interceptors.request.use(config => {
    const userId = getTokenUserId();
    if (config._requestUserId && config._requestUserId !== userId) throw new Error('Tài khoản đã thay đổi. Đăng nhập lại đúng tài khoản của yêu cầu cũ.');
    config._requestUserId ||= userId;
    config.withCredentials = true;
    config.headers['X-TotMart-Request'] = '1';
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    else delete config.headers.Authorization;
    return config;
  });
  instance.interceptors.response.use(response => response.data, async error => {
    const config = error.config;
    if (error.response?.status === 401 && config && !config._retried && !/\/home\/(login|refresh|forgot-password|reset-password)/.test(config.url || '')) {
      config._retried = true;
      try {
        if (!refreshing) refreshing = axios.post(`${instance.defaults.baseURL.replace(/\/$/, '')}/home/refresh`, {}, { timeout: 10000, withCredentials: true, headers: { 'X-TotMart-Request': '1' } })
          .then(response => {
            const token = response.data.token;
            const subject = jwtDecode(token).userId;
            if (config._requestUserId && (subject !== config._requestUserId || getTokenUserId() !== config._requestUserId)) throw new Error('Tài khoản refresh không khớp yêu cầu cũ.');
            saveToken(token); return token;
          }).finally(() => { refreshing = null; });
        const token = await refreshing;
        if (config._requestUserId && (jwtDecode(token).userId !== config._requestUserId || getTokenUserId() !== config._requestUserId)) throw new Error('Tài khoản đã thay đổi trong lúc refresh.');
        config.headers.Authorization = `Bearer ${token}`;
        return instance(config);
      } catch (failure) {
        if (getTokenUserId() === config._requestUserId) {
          clearSession();
          if (typeof window !== 'undefined' && [401,403].includes(failure.response?.status)) window.dispatchEvent(new Event('totmart:session-expired'));
        }
      }
    }
    return Promise.reject(error);
  });
}
