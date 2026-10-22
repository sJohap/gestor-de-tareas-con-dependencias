import {
  findRefreshTokenByHash,
  insertRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokensForUser,
} from "../repositories/refresh-token.repository";
import { findUserById } from "../repositories/user.repository";
import type { User } from "../types/user";
import { signAccessToken } from "../utils/access-token";
import { assertOwner } from "../utils/assert-owner";
import { HttpError } from "../utils/http-error";
import { generateRefreshToken, hashRefreshToken } from "../utils/refresh-token";
import { env } from "../config/env";

export type AuthSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

async function persistRefreshToken(userId: string): Promise<string> {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlSeconds * 1000);

  await insertRefreshToken({
    userId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  });

  return refreshToken;
}

export async function createAuthSession(user: User): Promise<AuthSession> {
  return {
    user,
    accessToken: signAccessToken(user),
    refreshToken: await persistRefreshToken(user.id),
  };
}

export async function rotateAuthSession(rawRefreshToken: string): Promise<AuthSession> {
  const stored = await findRefreshTokenByHash(hashRefreshToken(rawRefreshToken));

  if (!stored) {
    throw new HttpError(401, "Sesión inválida");
  }

  if (stored.revokedAt) {
    await revokeRefreshTokensForUser(stored.userId);
    throw new HttpError(401, "Sesión inválida");
  }

  if (new Date(stored.expiresAt).getTime() <= Date.now()) {
    await revokeRefreshToken(stored.id);
    throw new HttpError(401, "Sesión inválida");
  }

  const user = await findUserById(stored.userId);

  if (!user) {
    await revokeRefreshToken(stored.id);
    throw new HttpError(401, "Sesión inválida");
  }

  await revokeRefreshToken(stored.id);

  return createAuthSession(user);
}

export async function revokeAuthSession(
  rawRefreshToken: string | undefined,
  actorId: string,
): Promise<void> {
  if (!rawRefreshToken) {
    return;
  }

  const stored = await findRefreshTokenByHash(hashRefreshToken(rawRefreshToken));

  if (!stored || stored.revokedAt) {
    return;
  }

  assertOwner(actorId, stored.userId);
  await revokeRefreshToken(stored.id);
}
