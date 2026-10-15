import { pool } from "../config/database";
import type { NewUser, User, UserWithPassword } from "../types/user";

export async function insertUser(user: NewUser): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at AS "createdAt"`,
    [user.name, user.email, user.passwordHash]
  );

  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  const result = await pool.query<UserWithPassword>(
    `SELECT id, name, email, role, created_at AS "createdAt", password_hash AS "passwordHash"
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] ?? null;
}
