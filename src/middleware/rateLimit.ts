import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from './error';

interface RateLimitRecord {
  timestamps: number[];
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

/**
 * In-memory IP tracking store.
 * Suitable for single-instance Node.js deployments and development environments.
 * Note: Multi-instance production deployments should use Redis or a distributed cache
 * to share rate-limit counters across cluster nodes.
 */
class InMemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = options;
  }

  public setOptions(options: Partial<RateLimitOptions>): void {
    this.options = { ...this.options, ...options };
  }

  public reset(): void {
    this.store.clear();
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // In test environment, allow bypassing rate limiting unless explicitly enabled for rate-limit tests
      if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
        return next();
      }

      const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
      const now = Date.now();
      const windowStart = now - this.options.windowMs;

      let record = this.store.get(ip);
      if (!record) {
        record = { timestamps: [] };
        this.store.set(ip, record);
      }

      // Filter out timestamps outside the active rolling window
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

      const limit = this.options.max;
      const currentCount = record.timestamps.length;
      const remaining = Math.max(0, limit - currentCount - 1);

      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());

      if (currentCount >= limit) {
        const oldestTimestamp = record.timestamps[0];
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((oldestTimestamp + this.options.windowMs - now) / 1000),
        );

        res.setHeader('Retry-After', retryAfterSeconds.toString());
        return next(
          new TooManyRequestsError(
            this.options.message || 'Too many login attempts. Please try again later.',
          ),
        );
      }

      record.timestamps.push(now);
      next();
    };
  }
}

/**
 * Default login rate limiter: 10 attempts per 15-minute window per IP.
 */
export const loginRateLimiterInstance = new InMemoryRateLimiter({
  windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '10', 10), // 10 attempts
  message: 'Too many login attempts. Please try again in a few minutes.',
});

export const loginRateLimiter = loginRateLimiterInstance.middleware();

export function resetLoginRateLimiter(): void {
  loginRateLimiterInstance.reset();
}

export function configureLoginRateLimit(opts: Partial<RateLimitOptions>): void {
  loginRateLimiterInstance.setOptions(opts);
}
