export type TaskStatus = "pending" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  durationDays: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskRecord = Task & {
  userId: string;
};

export type NewTask = {
  userId: string;
  title: string;
  description: string | null;
  durationDays: number;
};

export type TaskUpdate = {
  title: string;
  description: string | null;
  status: TaskStatus;
  durationDays: number;
};

export type TaskDependency = {
  id: string;
  taskId: string;
  dependsOnId: string;
  createdAt: Date;
};
