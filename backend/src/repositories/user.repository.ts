import { pool } from "../config/database";
import type { Db } from "../db/transaction";
import type { NewUser, User, UserWithPassword } from "../types/user";

const userColumns = `id, name, email, role, avatar_url AS "avatarUrl", created_at AS "createdAt"`;

export async function insertUser(user: NewUser): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING ${userColumns}`,
    [user.name, user.email, user.passwordHash]
  );

  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  const result = await pool.query<UserWithPassword>(
    `SELECT ${userColumns}, password_hash AS "passwordHash"
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function findUserById(id: string, db: Db = pool): Promise<User | null> {
  const result = await db.query<User>(
    `SELECT ${userColumns}
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function listUsers(): Promise<User[]> {
  const result = await pool.query<User>(
    `SELECT ${userColumns}
     FROM users
     ORDER BY created_at ASC`
  );

  return result.rows;
}

export async function updateOwnProfile(
  id: string,
  profile: { name: string; avatarUrl: string | null },
): Promise<User | null> {
  const result = await pool.query<User>(
    `UPDATE users
     SET name = $1, avatar_url = $2
     WHERE id = $3
     RETURNING ${userColumns}`,
    [profile.name, profile.avatarUrl, id]
  );

  return result.rows[0] ?? null;
}
