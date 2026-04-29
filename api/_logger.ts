/**
 * Structured logger using Pino. JSON output that Vercel's log pipeline
 * can index and filter. Replaces ad-hoc `console.log` in server code.
 *
 * Usage:
 *   import { logger } from './_logger.js';
 *   logger.info({ userId, releaseId }, 'release submitted');
 *   logger.warn({ err }, 'cloudinary fallback to memory storage');
 *   logger.error({ err, route: '/api/anr' }, 'critique failed');
 */
import pino from 'pino';

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = pino({
  level,
  base: { service: 'dropkast' },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

/** Express middleware: log every request with method, path, status, and duration. */
export function httpLog(req: any, res: any, next: any): void {
  const start = Date.now();
  res.on('finish', () => {
    const dur = Date.now() - start;
    logger.info(
      {
        method: req.method,
        path: req.originalUrl ?? req.url,
        status: res.statusCode,
        durationMs: dur,
        ip: req.headers['x-forwarded-for'] ?? req.ip,
      },
      'http',
    );
  });
  next();
}
