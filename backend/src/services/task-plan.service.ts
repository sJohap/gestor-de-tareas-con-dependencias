import { kahnOrder } from "../domain/kahn";
import { buildDependsOn } from "../domain/dependency-graph";
import { executionState, type ExecutionState } from "../domain/task-readiness";
import { listDependencyEdgesForUser } from "../repositories/task-dependency.repository";
import { listTasksByUser } from "../repositories/task.repository";
import type { Task, TaskStatus } from "../types/task";

export type PlannedTask = Task & {
  dependsOnIds: string[];
  executionState: ExecutionState;
};

export type TaskOrderItem = {
  position: number;
  id: string;
  title: string;
};

export type TaskPlan = {
  hasCycle: boolean;
  order: TaskOrderItem[];
  tasks: PlannedTask[];
};

export async function buildTaskPlan(actorId: string): Promise<TaskPlan> {
  const records = await listTasksByUser(actorId);
  const edges = await listDependencyEdgesForUser(actorId);
  const dependsOn = buildDependsOn(edges);
  const statusById = new Map<string, TaskStatus>(records.map((task) => [task.id, task.status]));
  const titleById = new Map<string, string>(records.map((task) => [task.id, task.title]));
  const { order, hasCycle } = kahnOrder(
    records.map((task) => task.id),
    edges,
  );

  const tasks: PlannedTask[] = records.map((task) => {
    const dependsOnIds = dependsOn.get(task.id) ?? [];

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dependsOnIds,
      executionState: executionState(
        task.status,
        dependsOnIds.map((dependencyId) => statusById.get(dependencyId)),
      ),
    };
  });

  return {
    hasCycle,
    order: order.map((id, index) => ({
      position: index + 1,
      id,
      title: titleById.get(id) ?? "",
    })),
    tasks,
  };
}
