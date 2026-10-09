import axios from 'axios';
import { getAccessToken, saveToken, clearSession } from './tokenMiddleware';
let refreshing = null;
export function setupAxiosMiddleware(instance) {
  instance.interceptors.request.use(config => {
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
        if (!refreshing) refreshing = axios.post(`${instance.defaults.baseURL.replace(/\/$/, '')}/home/refresh`, {}, { withCredentials: true, headers: { 'X-TotMart-Request': '1' } })
          .then(response => { saveToken(response.data.token); return response.data.token; }).finally(() => { refreshing = null; });
        const token = await refreshing;
        config.headers.Authorization = `Bearer ${token}`;
        return instance(config);
      } catch { clearSession(); }
    }
    return Promise.reject(error);
  });
}
