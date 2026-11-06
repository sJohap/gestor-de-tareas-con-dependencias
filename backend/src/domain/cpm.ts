export type CpmTask = {
  id: string;
  durationDays: number;
  dependsOnIds: string[];
};

export type CpmSchedule = {
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  critical: boolean;
};

export type CriticalPathResult = {
  projectDays: number;
  schedule: Map<string, CpmSchedule>;
};

export function criticalPath(tasks: CpmTask[], order: string[]): CriticalPathResult | null {
  if (order.length !== tasks.length) {
    return null;
  }

  const byId = new Map(tasks.map((task) => [task.id, task]));
  const successors = new Map<string, string[]>();

  for (const task of tasks) {
    successors.set(task.id, []);
  }

  for (const task of tasks) {
    for (const dependencyId of task.dependsOnIds) {
      const next = successors.get(dependencyId) ?? [];
      next.push(task.id);
      successors.set(dependencyId, next);
    }
  }

  const earliestStart = new Map<string, number>();
  const earliestFinish = new Map<string, number>();

  for (const id of order) {
    const task = byId.get(id);

    if (!task) {
      return null;
    }

    const start = task.dependsOnIds.reduce((latest, dependencyId) => {
      return Math.max(latest, earliestFinish.get(dependencyId) ?? 0);
    }, 0);

    earliestStart.set(id, start);
    earliestFinish.set(id, start + task.durationDays);
  }

  const projectDays = order.reduce((longest, id) => {
    return Math.max(longest, earliestFinish.get(id) ?? 0);
  }, 0);

  const latestStart = new Map<string, number>();
  const latestFinish = new Map<string, number>();

  for (const id of [...order].reverse()) {
    const task = byId.get(id);

    if (!task) {
      return null;
    }

    const following = successors.get(id) ?? [];
    const finish =
      following.length === 0
        ? projectDays
        : following.reduce((soonest, successorId) => {
            return Math.min(soonest, latestStart.get(successorId) ?? projectDays);
          }, projectDays);

    latestFinish.set(id, finish);
    latestStart.set(id, finish - task.durationDays);
  }

  const schedule = new Map<string, CpmSchedule>();

  for (const id of order) {
    const start = earliestStart.get(id) ?? 0;
    const lateStart = latestStart.get(id) ?? 0;
    const slack = lateStart - start;

    schedule.set(id, {
      earliestStart: start,
      earliestFinish: earliestFinish.get(id) ?? 0,
      latestStart: lateStart,
      latestFinish: latestFinish.get(id) ?? 0,
      slack,
      critical: slack === 0,
    });
  }

  return { projectDays, schedule };
}
