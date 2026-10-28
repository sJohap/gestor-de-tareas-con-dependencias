export type TaskStatus = 'pending' | 'in_progress' | 'done'

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
  dependsOnIds: string[]
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Completada',
}
