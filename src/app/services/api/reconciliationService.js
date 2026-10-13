import { axiosConfig } from './axiosConfig';
import { getTokenUserId } from '@/app/middleware/tokenMiddleware';
const prefix = '/admin/reconciliation';
export const listRefunds = page => axiosConfig.get(prefix + '/refunds', { params: { page } });
export const listAudit = page => axiosConfig.get(prefix + '/audit', { params: { page } });
export async function reconciliationCommand(action, path, payload) {
  const scope = `totmart_reconciliation_${getTokenUserId()}_${action}`;
  const signature = JSON.stringify(payload);
  let previous;
  try { previous = JSON.parse(sessionStorage.getItem(scope) || 'null'); } catch { previous = null; }
  const attempt = previous?.signature === signature ? previous : { key: crypto.randomUUID(), signature };
  // Persist BEFORE network request so reload/retry preserves identity on ambiguous outcomes.
  sessionStorage.setItem(scope, JSON.stringify(attempt));
  try {
    const response = await axiosConfig.post(prefix + path, payload, { headers: { 'Idempotency-Key': attempt.key } });
    sessionStorage.removeItem(scope);
    return response;
  } catch (err) {
    if (err.response?.status && err.response.status < 500) sessionStorage.removeItem(scope);
    throw err;
  }
}
