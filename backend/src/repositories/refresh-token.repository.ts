import { pool } from "../config/database";
import type { NewRefreshToken, RefreshToken } from "../types/refresh-token";

export async function insertRefreshToken(token: NewRefreshToken): Promise<RefreshToken> {
  const result = await pool.query<RefreshToken>(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id AS "userId", token_hash AS "tokenHash",
               expires_at AS "expiresAt", revoked_at AS "revokedAt",
               created_at AS "createdAt"`,
    [token.userId, token.tokenHash, token.expiresAt]
  );

  return result.rows[0];
}

export async function findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
  const result = await pool.query<RefreshToken>(
    `SELECT id, user_id AS "userId", token_hash AS "tokenHash",
            expires_at AS "expiresAt", revoked_at AS "revokedAt",
            created_at AS "createdAt"
     FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function revokeRefreshToken(id: string): Promise<void> {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE id = $1 AND revoked_at IS NULL`,
    [id]
  );
}

export async function revokeRefreshTokensForUser(userId: string): Promise<void> {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}
