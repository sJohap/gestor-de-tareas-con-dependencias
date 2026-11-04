export type DependencyEdge = {
  taskId: string;
  dependsOnId: string;
};

export function buildDependsOn(edges: DependencyEdge[]): Map<string, string[]> {
  const dependsOn = new Map<string, string[]>();

  for (const edge of edges) {
    const current = dependsOn.get(edge.taskId) ?? [];
    current.push(edge.dependsOnId);
    dependsOn.set(edge.taskId, current);
  }

  return dependsOn;
}

export function reaches(
  start: string,
  target: string,
  dependsOn: Map<string, string[]>,
): boolean {
  const seen = new Set<string>();
  const pending = [start];

  while (pending.length > 0) {
    const current = pending.pop();

    if (!current || seen.has(current)) {
      continue;
    }

    seen.add(current);

    for (const next of dependsOn.get(current) ?? []) {
      if (next === target) {
        return true;
      }

      pending.push(next);
    }
  }

  return false;
}

export function wouldCreateCycle(
  edges: DependencyEdge[],
  taskId: string,
  dependsOnId: string,
): boolean {
  if (taskId === dependsOnId) {
    return true;
  }

  return reaches(dependsOnId, taskId, buildDependsOn(edges));
}
