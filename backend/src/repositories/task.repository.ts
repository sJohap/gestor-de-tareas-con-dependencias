import { pool } from "../config/database";
import type { Db } from "../db/transaction";
import type { NewTask, TaskRecord, TaskUpdate } from "../types/task";

const taskColumns = `id, user_id AS "userId", title, description, status,
  duration_days AS "durationDays", created_at AS "createdAt", updated_at AS "updatedAt"`;

export async function insertTask(task: NewTask): Promise<TaskRecord> {
  const result = await pool.query<TaskRecord>(
    `INSERT INTO tasks (user_id, title, description, duration_days)
     VALUES ($1, $2, $3, $4)
     RETURNING ${taskColumns}`,
    [task.userId, task.title, task.description, task.durationDays]
  );

  return result.rows[0];
}

export async function listTasksByUser(userId: string): Promise<TaskRecord[]> {
  const result = await pool.query<TaskRecord>(
    `SELECT ${taskColumns}
     FROM tasks
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function findTaskById(id: string, db: Db = pool): Promise<TaskRecord | null> {
  const result = await db.query<TaskRecord>(
    `SELECT ${taskColumns}
     FROM tasks
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function lockTasksForUpdate(
  userId: string,
  taskIds: string[],
  db: Db,
): Promise<TaskRecord[]> {
  const result = await db.query<TaskRecord>(
    `SELECT ${taskColumns}
     FROM tasks
     WHERE user_id = $1 OR id = ANY($2::uuid[])
     ORDER BY id
     FOR UPDATE`,
    [userId, taskIds]
  );

  return result.rows;
}

export async function updateTask(
  id: string,
  userId: string,
  task: TaskUpdate,
  db: Db = pool,
): Promise<TaskRecord | null> {
  const result = await db.query<TaskRecord>(
    `UPDATE tasks
     SET title = $1, description = $2, status = $3, duration_days = $4, updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING ${taskColumns}`,
    [task.title, task.description, task.status, task.durationDays, id, userId]
  );

  return result.rows[0] ?? null;
}

export async function deleteTask(id: string, userId: string, db: Db = pool): Promise<boolean> {
  const result = await db.query(
    `DELETE FROM tasks
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  return (result.rowCount ?? 0) > 0;
}
