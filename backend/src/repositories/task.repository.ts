import { pool } from "../config/database";
import type { NewTask, TaskRecord, TaskUpdate } from "../types/task";

const taskColumns = `id, user_id AS "userId", title, description, status,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

export async function insertTask(task: NewTask): Promise<TaskRecord> {
  const result = await pool.query<TaskRecord>(
    `INSERT INTO tasks (user_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING ${taskColumns}`,
    [task.userId, task.title, task.description]
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

export async function findTaskById(id: string): Promise<TaskRecord | null> {
  const result = await pool.query<TaskRecord>(
    `SELECT ${taskColumns}
     FROM tasks
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function updateTask(
  id: string,
  userId: string,
  task: TaskUpdate,
): Promise<TaskRecord | null> {
  const result = await pool.query<TaskRecord>(
    `UPDATE tasks
     SET title = $1, description = $2, status = $3, updated_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING ${taskColumns}`,
    [task.title, task.description, task.status, id, userId]
  );

  return result.rows[0] ?? null;
}

export async function deleteTask(id: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM tasks
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  return (result.rowCount ?? 0) > 0;
}
