import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env";
import { REFRESH_COOKIE_NAME } from "./refresh-token";

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    path: "/auth",
    maxAge: env.refreshTokenTtlSeconds * 1000,
  };
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    path: "/auth",
  });
}

export function readRefreshCookie(req: Request): string | undefined {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  return token && token.length > 0 ? token : undefined;
}
