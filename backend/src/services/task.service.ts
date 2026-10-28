import {
  deleteTask,
  findTaskById,
  insertTask,
  listTasksByUser,
  updateTask,
} from "../repositories/task.repository";
import type { CreateTaskInput, UpdateTaskInput } from "../schemas/task.schema";
import type { Task, TaskRecord } from "../types/task";
import { assertOwner } from "../utils/assert-owner";
import { HttpError } from "../utils/http-error";

function toTask(record: TaskRecord): Task {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function requireOwnTask(taskId: string, actorId: string): Promise<TaskRecord> {
  const task = await findTaskById(taskId);

  if (!task) {
    throw new HttpError(404, "Tarea no encontrada");
  }

  assertOwner(actorId, task.userId);
  return task;
}

export async function createTask(actorId: string, input: CreateTaskInput): Promise<Task> {
  const task = await insertTask({
    userId: actorId,
    title: input.title,
    description: input.description,
  });

  return toTask(task);
}

export async function listTasks(actorId: string): Promise<Task[]> {
  const tasks = await listTasksByUser(actorId);
  return tasks.map(toTask);
}

export async function editTask(
  actorId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  await requireOwnTask(taskId, actorId);

  const task = await updateTask(taskId, actorId, input);

  if (!task) {
    throw new HttpError(404, "Tarea no encontrada");
  }

  return toTask(task);
}

export async function removeTask(actorId: string, taskId: string): Promise<void> {
  await requireOwnTask(taskId, actorId);

  const deleted = await deleteTask(taskId, actorId);

  if (!deleted) {
    throw new HttpError(404, "Tarea no encontrada");
  }
}
