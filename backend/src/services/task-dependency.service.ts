import { DatabaseError } from "pg";
import { wouldCreateCycle } from "../domain/dependency-graph";
import { withTransaction } from "../db/transaction";
import {
  deleteTaskDependency,
  insertTaskDependency,
  listDependencyEdgesForUser,
} from "../repositories/task-dependency.repository";
import { lockTasksForUpdate } from "../repositories/task.repository";
import type { TaskDependency, TaskRecord } from "../types/task";
import { assertOwner } from "../utils/assert-owner";
import { HttpError } from "../utils/http-error";

const UNIQUE_VIOLATION = "23505";

function requireLockedTask(tasks: TaskRecord[], taskId: string, actorId: string): void {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new HttpError(404, "Tarea no encontrada");
  }

  assertOwner(actorId, task.userId);
}

export async function listDependencies(actorId: string): Promise<TaskDependency[]> {
  return listDependencyEdgesForUser(actorId);
}

export async function addDependency(
  actorId: string,
  taskId: string,
  dependsOnId: string,
): Promise<TaskDependency> {
  if (taskId === dependsOnId) {
    throw new HttpError(400, "Una tarea no puede depender de sí misma");
  }

  try {
    return await withTransaction(async (db) => {
      const locked = await lockTasksForUpdate(actorId, [taskId, dependsOnId], db);
      requireLockedTask(locked, taskId, actorId);
      requireLockedTask(locked, dependsOnId, actorId);

      const edges = await listDependencyEdgesForUser(actorId, db);

      if (wouldCreateCycle(edges, taskId, dependsOnId)) {
        throw new HttpError(409, "Esa dependencia forma un ciclo");
      }

      return insertTaskDependency(taskId, dependsOnId, db);
    });
  } catch (error) {
    if (error instanceof DatabaseError && error.code === UNIQUE_VIOLATION) {
      throw new HttpError(409, "Esa dependencia ya existe");
    }

    throw error;
  }
}

export async function removeDependency(
  actorId: string,
  taskId: string,
  dependsOnId: string,
): Promise<void> {
  await withTransaction(async (db) => {
    const locked = await lockTasksForUpdate(actorId, [taskId, dependsOnId], db);
    requireLockedTask(locked, taskId, actorId);

    const deleted = await deleteTaskDependency(taskId, dependsOnId, db);

    if (!deleted) {
      throw new HttpError(404, "Esa dependencia no existe");
    }
  });
}
