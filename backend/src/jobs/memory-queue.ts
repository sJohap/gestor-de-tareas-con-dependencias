import { randomUUID } from "node:crypto";

export type JobHandler = () => Promise<void>;

type QueuedJob = {
  id: string;
  name: string;
  attempts: number;
  maxAttempts: number;
  runAt: number;
};

export type FailedJob = {
  id: string;
  name: string;
  error: string;
};

export type MemoryQueue = {
  register: (name: string, handler: JobHandler) => void;
  enqueue: (name: string) => void;
  start: () => void;
  stop: () => void;
  drain: (asOf?: number) => Promise<void>;
  pending: () => number;
  failures: () => FailedJob[];
};

export function createMemoryQueue(): MemoryQueue {
  const handlers = new Map<string, JobHandler>();
  const pendingJobs: QueuedJob[] = [];
  const failedJobs: FailedJob[] = [];
  let timer: ReturnType<typeof setInterval> | null = null;
  let working = false;

  function register(name: string, handler: JobHandler): void {
    handlers.set(name, handler);
  }

  function enqueue(name: string): void {
    pendingJobs.push({
      id: randomUUID(),
      name,
      attempts: 0,
      maxAttempts: 5,
      runAt: Date.now(),
    });
  }

  function takeDue(asOf: number): QueuedJob | undefined {
    let chosenAt = Number.POSITIVE_INFINITY;
    let index = -1;

    pendingJobs.forEach((job, position) => {
      if (job.runAt <= asOf && job.runAt < chosenAt) {
        chosenAt = job.runAt;
        index = position;
      }
    });

    if (index < 0) {
      return undefined;
    }

    return pendingJobs.splice(index, 1)[0];
  }

  async function drain(asOf = Date.now()): Promise<void> {
    if (working) {
      return;
    }

    working = true;

    try {
      for (;;) {
        const job = takeDue(asOf);

        if (!job) {
          return;
        }

        const handler = handlers.get(job.name);

        try {
          if (!handler) {
            throw new Error(`No hay manejador para ${job.name}`);
          }

          await handler();
        } catch (error) {
          job.attempts += 1;
          const message = error instanceof Error ? error.message : "Fallo desconocido";

          if (!handler || job.attempts >= job.maxAttempts) {
            failedJobs.push({ id: job.id, name: job.name, error: message });
          } else {
            job.runAt = Date.now() + 200 * 2 ** (job.attempts - 1);
            pendingJobs.push(job);
          }
        }
      }
    } finally {
      working = false;
    }
  }

  function start(): void {
    if (timer) {
      return;
    }

    timer = setInterval(() => {
      void drain();
    }, 250);
    timer.unref();
  }

  function stop(): void {
    if (!timer) {
      return;
    }

    clearInterval(timer);
    timer = null;
  }

  return {
    register,
    enqueue,
    start,
    stop,
    drain,
    pending: () => pendingJobs.length,
    failures: () => failedJobs.slice(),
  };
}

export const jobQueue = createMemoryQueue();
