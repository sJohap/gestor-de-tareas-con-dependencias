import { kahnOrder } from "../domain/kahn";
import { criticalPath } from "../domain/cpm";
import { buildDependsOn } from "../domain/dependency-graph";
import { executionState, type ExecutionState } from "../domain/task-readiness";
import { listDependencyEdgesForUser } from "../repositories/task-dependency.repository";
import { listTasksByUser } from "../repositories/task.repository";
import type { Task, TaskStatus } from "../types/task";

export type PlannedTask = Task & {
  dependsOnIds: string[];
  executionState: ExecutionState;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  critical: boolean;
};

export type TaskOrderItem = {
  position: number;
  id: string;
  title: string;
  critical: boolean;
};

export type TaskPlan = {
  hasCycle: boolean;
  projectDays: number;
  order: TaskOrderItem[];
  tasks: PlannedTask[];
};

const emptySchedule = {
  earliestStart: 0,
  earliestFinish: 0,
  latestStart: 0,
  latestFinish: 0,
  slack: 0,
  critical: false,
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
  const path = hasCycle
    ? null
    : criticalPath(
        records.map((task) => ({
          id: task.id,
          durationDays: task.durationDays,
          dependsOnIds: dependsOn.get(task.id) ?? [],
        })),
        order,
      );

  const tasks: PlannedTask[] = records.map((task) => {
    const dependsOnIds = dependsOn.get(task.id) ?? [];
    const schedule = path?.schedule.get(task.id) ?? emptySchedule;

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      durationDays: task.durationDays,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dependsOnIds,
      executionState: executionState(
        task.status,
        dependsOnIds.map((dependencyId) => statusById.get(dependencyId)),
      ),
      ...schedule,
    };
  });

  return {
    hasCycle,
    projectDays: path?.projectDays ?? 0,
    order: order.map((id, index) => ({
      position: index + 1,
      id,
      title: titleById.get(id) ?? "",
      critical: path?.schedule.get(id)?.critical ?? false,
    })),
    tasks,
  };
}
