import { pool } from "../config/database";
import type { Db } from "../db/transaction";
import type { TaskDependency } from "../types/task";

export async function insertTaskDependency(
  taskId: string,
  dependsOnId: string,
  db: Db = pool,
): Promise<TaskDependency> {
  const result = await db.query<TaskDependency>(
    `INSERT INTO task_dependencies (task_id, depends_on_id)
     VALUES ($1, $2)
     RETURNING id, task_id AS "taskId", depends_on_id AS "dependsOnId",
               created_at AS "createdAt"`,
    [taskId, dependsOnId]
  );

  return result.rows[0];
}

export async function deleteTaskDependency(
  taskId: string,
  dependsOnId: string,
  db: Db = pool,
): Promise<boolean> {
  const result = await db.query(
    `DELETE FROM task_dependencies
     WHERE task_id = $1 AND depends_on_id = $2`,
    [taskId, dependsOnId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function listDependencyEdgesForUser(
  userId: string,
  db: Db = pool,
): Promise<TaskDependency[]> {
  const result = await db.query<TaskDependency>(
    `SELECT td.id, td.task_id AS "taskId", td.depends_on_id AS "dependsOnId",
            td.created_at AS "createdAt"
     FROM task_dependencies td
     JOIN tasks task ON task.id = td.task_id
     WHERE task.user_id = $1
     ORDER BY td.created_at ASC`,
    [userId]
  );

  return result.rows;
}
