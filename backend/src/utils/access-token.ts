import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { User, UserRole } from "../types/user";
import { HttpError } from "./http-error";

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
};

function isUserRole(value: unknown): value is UserRole {
  return value === "user" || value === "admin";
}

export function signAccessToken(user: User): string {
  return jwt.sign({ role: user.role }, env.jwtAccessSecret, {
    subject: user.id,
    expiresIn: env.accessTokenTtlSeconds,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtAccessSecret);

  if (typeof decoded === "string" || typeof decoded.sub !== "string" || !isUserRole(decoded.role)) {
    throw new HttpError(401, "Token inválido");
  }

  return {
    sub: decoded.sub,
    role: decoded.role,
  };
}
