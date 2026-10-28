import { DatabaseError } from "pg";
import {
  deleteTaskDependency,
  insertTaskDependency,
  listDependencyEdgesForUser,
} from "../repositories/task-dependency.repository";
import { findTaskById } from "../repositories/task.repository";
import type { TaskDependency } from "../types/task";
import { assertOwner } from "../utils/assert-owner";
import { HttpError } from "../utils/http-error";

const UNIQUE_VIOLATION = "23505";

async function requireOwnTaskId(taskId: string, actorId: string): Promise<void> {
  const task = await findTaskById(taskId);

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

  await requireOwnTaskId(taskId, actorId);
  await requireOwnTaskId(dependsOnId, actorId);

  try {
    return await insertTaskDependency(taskId, dependsOnId);
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
  await requireOwnTaskId(taskId, actorId);

  const deleted = await deleteTaskDependency(taskId, dependsOnId);

  if (!deleted) {
    throw new HttpError(404, "Esa dependencia no existe");
  }
}
