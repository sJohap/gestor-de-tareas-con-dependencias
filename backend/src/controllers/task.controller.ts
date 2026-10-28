import type { Request, Response } from "express";
import {
  createTaskSchema,
  dependencyParamsSchema,
  dependencySchema,
  taskParamsSchema,
  updateTaskSchema,
} from "../schemas/task.schema";
import { addDependency, listDependencies, removeDependency } from "../services/task-dependency.service";
import { createTask, editTask, listTasks, removeTask } from "../services/task.service";
import { HttpError } from "../utils/http-error";

function actorId(req: Request): string {
  if (!req.user) {
    throw new HttpError(401, "Falta el token de acceso");
  }

  return req.user.id;
}

export async function listTasksController(req: Request, res: Response): Promise<void> {
  const userId = actorId(req);
  const tasks = await listTasks(userId);
  const edges = await listDependencies(userId);
  const dependsOnIds = new Map<string, string[]>();

  for (const edge of edges) {
    const current = dependsOnIds.get(edge.taskId) ?? [];
    current.push(edge.dependsOnId);
    dependsOnIds.set(edge.taskId, current);
  }

  res.status(200).json({
    tasks: tasks.map((task) => ({
      ...task,
      dependsOnIds: dependsOnIds.get(task.id) ?? [],
    })),
  });
}

export async function createTaskController(req: Request, res: Response): Promise<void> {
  const input = createTaskSchema.parse(req.body);
  const task = await createTask(actorId(req), input);
  res.status(201).json({ task: { ...task, dependsOnIds: [] } });
}

export async function updateTaskController(req: Request, res: Response): Promise<void> {
  const params = taskParamsSchema.parse(req.params);
  const input = updateTaskSchema.parse(req.body);
  const task = await editTask(actorId(req), params.id, input);
  res.status(200).json({ task });
}

export async function deleteTaskController(req: Request, res: Response): Promise<void> {
  const params = taskParamsSchema.parse(req.params);
  await removeTask(actorId(req), params.id);
  res.status(204).send();
}

export async function addDependencyController(req: Request, res: Response): Promise<void> {
  const params = taskParamsSchema.parse(req.params);
  const input = dependencySchema.parse(req.body);
  const dependency = await addDependency(actorId(req), params.id, input.dependsOnId);
  res.status(201).json({ dependency });
}

export async function removeDependencyController(req: Request, res: Response): Promise<void> {
  const params = dependencyParamsSchema.parse(req.params);
  await removeDependency(actorId(req), params.id, params.dependsOnId);
  res.status(204).send();
}
