import { pool } from "../config/database";
import type { Db } from "../db/transaction";
import type { NewRefreshToken, RefreshToken } from "../types/refresh-token";

const tokenColumns = `id, user_id AS "userId", token_hash AS "tokenHash",
            expires_at AS "expiresAt", revoked_at AS "revokedAt",
            created_at AS "createdAt"`;

export async function insertRefreshToken(token: NewRefreshToken, db: Db = pool): Promise<RefreshToken> {
  const result = await db.query<RefreshToken>(
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
    `SELECT ${tokenColumns}
     FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function findRefreshTokenForUpdate(
  tokenHash: string,
  db: Db,
): Promise<RefreshToken | null> {
  const result = await db.query<RefreshToken>(
    `SELECT ${tokenColumns}
     FROM refresh_tokens
     WHERE token_hash = $1
     FOR UPDATE`,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function revokeRefreshToken(id: string, db: Db = pool): Promise<void> {
  await db.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE id = $1 AND revoked_at IS NULL`,
    [id]
  );
}

export async function revokeRefreshTokensForUser(userId: string, db: Db = pool): Promise<void> {
  await db.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

export async function deleteExpiredRefreshTokens(db: Db = pool): Promise<number> {
  const result = await db.query(
    `DELETE FROM refresh_tokens
     WHERE expires_at < NOW()
        OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '1 day')`
  );

  return result.rowCount ?? 0;
}
