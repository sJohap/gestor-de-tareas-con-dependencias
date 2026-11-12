import { withTransaction } from "../db/transaction";
import { jobQueue } from "../jobs/memory-queue";
import {
  findRefreshTokenForUpdate,
  insertRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokensForUser,
} from "../repositories/refresh-token.repository";
import { findUserById } from "../repositories/user.repository";
import type { Db } from "../db/transaction";
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

async function persistRefreshToken(userId: string, db?: Db): Promise<string> {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlSeconds * 1000);

  const stored = {
    userId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  };

  if (db) {
    await insertRefreshToken(stored, db);
  } else {
    await insertRefreshToken(stored);
  }

  return refreshToken;
}

function scheduleSessionCleanup(): void {
  jobQueue.enqueue("purge-expired-sessions");
}

export async function createAuthSession(user: User): Promise<AuthSession> {
  const session = {
    user,
    accessToken: signAccessToken(user),
    refreshToken: await persistRefreshToken(user.id),
  };

  scheduleSessionCleanup();
  return session;
}

export async function rotateAuthSession(rawRefreshToken: string): Promise<AuthSession> {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  let stolen = false;

  const session = await withTransaction(async (db) => {
    const stored = await findRefreshTokenForUpdate(tokenHash, db);

    if (!stored) {
      throw new HttpError(401, "Sesión inválida");
    }

    if (stored.revokedAt) {
      await revokeRefreshTokensForUser(stored.userId, db);
      stolen = true;
      return null;
    }

    if (new Date(stored.expiresAt).getTime() <= Date.now()) {
      await revokeRefreshToken(stored.id, db);
      throw new HttpError(401, "Sesión inválida");
    }

    const user = await findUserById(stored.userId, db);

    if (!user) {
      await revokeRefreshToken(stored.id, db);
      throw new HttpError(401, "Sesión inválida");
    }

    await revokeRefreshToken(stored.id, db);

    return {
      user,
      accessToken: signAccessToken(user),
      refreshToken: await persistRefreshToken(user.id, db),
    };
  });

  scheduleSessionCleanup();

  if (stolen || !session) {
    throw new HttpError(401, "Sesión inválida");
  }

  return session;
}

export async function revokeAuthSession(
  rawRefreshToken: string | undefined,
  actorId: string,
): Promise<void> {
  if (!rawRefreshToken) {
    return;
  }

  await withTransaction(async (db) => {
    const stored = await findRefreshTokenForUpdate(hashRefreshToken(rawRefreshToken), db);

    if (!stored || stored.revokedAt) {
      return;
    }

    assertOwner(actorId, stored.userId);
    await revokeRefreshToken(stored.id, db);
  });

  scheduleSessionCleanup();
}
