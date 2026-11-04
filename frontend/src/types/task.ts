export type TaskStatus = 'pending' | 'in_progress' | 'done'
export type ExecutionState = 'ready' | 'blocked' | 'done'

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
  dependsOnIds: string[]
  executionState: ExecutionState
}

export type TaskOrderItem = {
  position: number
  id: string
  title: string
}

export type TaskPlan = {
  hasCycle: boolean
  order: TaskOrderItem[]
  tasks: Task[]
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Completada',
}

export const executionStateLabels: Record<ExecutionState, string> = {
  ready: 'Lista',
  blocked: 'Bloqueada',
  done: 'Completada',
}
