import type { NextFunction, Request, Response } from "express";

type Bucket = {
  count: number;
  resetAt: number;
};

export function rateLimit(options: { windowMs: number; max: number; message: string }) {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = req.ip ?? "desconocida";
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (current.count >= options.max) {
      res.status(429).json({
        status: "error",
        message: options.message,
      });
      return;
    }

    current.count += 1;
    next();
  };
}

export function createAuthRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message: "Demasiados intentos. Espera un momento e inténtalo de nuevo",
  });
}
