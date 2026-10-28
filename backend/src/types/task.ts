export type TaskStatus = "pending" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
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
};

export type TaskUpdate = {
  title: string;
  description: string | null;
  status: TaskStatus;
};

export type TaskDependency = {
  id: string;
  taskId: string;
  dependsOnId: string;
  createdAt: Date;
};
