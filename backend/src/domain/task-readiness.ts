import type { TaskStatus } from "../types/task";

export type ExecutionState = "ready" | "blocked" | "done";

export function executionState(
  status: TaskStatus,
  dependencyStatuses: Array<TaskStatus | undefined>,
): ExecutionState {
  if (status === "done") {
    return "done";
  }

  const waiting = dependencyStatuses.some((dependencyStatus) => dependencyStatus !== "done");
  return waiting ? "blocked" : "ready";
}
