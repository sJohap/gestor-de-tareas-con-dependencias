import type { DependencyEdge } from "./dependency-graph";

export type KahnResult = {
  order: string[];
  hasCycle: boolean;
};

export function kahnOrder(taskIds: string[], edges: DependencyEdge[]): KahnResult {
  const indegree = new Map<string, number>();
  const successors = new Map<string, string[]>();

  for (const taskId of taskIds) {
    indegree.set(taskId, 0);
    successors.set(taskId, []);
  }

  for (const edge of edges) {
    if (!indegree.has(edge.taskId) || !indegree.has(edge.dependsOnId)) {
      continue;
    }

    const next = successors.get(edge.dependsOnId) ?? [];
    next.push(edge.taskId);
    successors.set(edge.dependsOnId, next);
    indegree.set(edge.taskId, (indegree.get(edge.taskId) ?? 0) + 1);
  }

  const queue = taskIds.filter((taskId) => indegree.get(taskId) === 0);
  const order: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    order.push(current);

    for (const next of successors.get(current) ?? []) {
      const degree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, degree);

      if (degree === 0) {
        queue.push(next);
      }
    }
  }

  return {
    order,
    hasCycle: order.length !== taskIds.length,
  };
}
