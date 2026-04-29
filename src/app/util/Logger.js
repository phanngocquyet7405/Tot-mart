/**
 * logger.js
 *
 * Wrapper cho console — chỉ hoạt động khi NODE_ENV === 'development'.
 * Production: tất cả log bị ẩn hoàn toàn, không để lộ thông tin nhạy cảm.
 *
 * Cách dùng:
 *   import logger from '@/app/utils/logger';
 *
 *   logger.log('data:', data);
 *   logger.warn('[401] Token hết hạn');
 *   logger.error('[500] Server lỗi', error);
 *   logger.info('Cart loaded', cartData);
 *   logger.group('Auth Flow');
 *   logger.groupEnd();
 *   logger.table(arrayOfObjects);
 */

const isDev = process.env.NODE_ENV === "development";

const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  error: (...args) => {
    if (isDev) console.error(...args);
  },
  info: (...args) => {
    if (isDev) console.info(...args);
  },
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },
  group: (...args) => {
    if (isDev) console.group(...args);
  },
  groupEnd: () => {
    if (isDev) console.groupEnd();
  },
  table: (...args) => {
    if (isDev) console.table(...args);
  },
};

export default logger;
