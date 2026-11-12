import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { Task, TaskOrderItem, TaskPlan, TaskStatus } from '@/types/task'

const CACHE_MS = 15_000

type TaskDraft = {
  title: string
  description: string
  durationDays: number
}

type TaskPatch = {
  title: string
  description: string
  status: TaskStatus
  durationDays: number
}

export const useTaskStore = defineStore('tasks', () => {
  const tasksById = ref<Record<string, Task>>({})
  const taskIds = ref<string[]>([])
  const order = ref<TaskOrderItem[]>([])
  const hasCycle = ref(false)
  const projectDays = ref(0)
  const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const errorMessage = ref<string | null>(null)
  const cachedAt = ref<number | null>(null)

  const tasks = computed(() =>
    taskIds.value.flatMap((id) => {
      const task = tasksById.value[id]
      return task ? [task] : []
    }),
  )
  const loading = computed(() => status.value === 'loading')

  function clear(): void {
    tasksById.value = {}
    taskIds.value = []
    order.value = []
    hasCycle.value = false
    projectDays.value = 0
    status.value = 'idle'
    errorMessage.value = null
    cachedAt.value = null
  }

  function replacePlan(plan: TaskPlan): void {
    const next: Record<string, Task> = {}
    const ids: string[] = []

    for (const task of plan.tasks) {
      next[task.id] = task
      ids.push(task.id)
    }

    tasksById.value = next
    taskIds.value = ids
    order.value = plan.order
    hasCycle.value = plan.hasCycle
    projectDays.value = plan.projectDays
    cachedAt.value = Date.now()
    status.value = 'ready'
    errorMessage.value = null
  }

  async function loadPlan(force = false): Promise<void> {
    const fresh =
      status.value === 'ready' && cachedAt.value !== null && Date.now() - cachedAt.value < CACHE_MS

    if (!force && fresh) {
      return
    }

    if (status.value !== 'ready') {
      status.value = 'loading'
    }

    try {
      const response = await api.get<TaskPlan>('/tasks/plan')
      replacePlan(response.data)
    } catch (error) {
      status.value = taskIds.value.length > 0 ? 'ready' : 'error'
      errorMessage.value = getApiErrorMessage(error)
      throw error
    }
  }

  async function change(work: () => Promise<void>): Promise<void> {
    errorMessage.value = null

    try {
      await work()
      await loadPlan(true)
    } catch (error) {
      errorMessage.value = getApiErrorMessage(error)
      throw error
    }
  }

  function createTask(draft: TaskDraft): Promise<void> {
    return change(() => api.post('/tasks', draft).then(() => undefined))
  }

  function saveTask(taskId: string, patch: TaskPatch): Promise<void> {
    return change(() => api.patch(`/tasks/${taskId}`, patch).then(() => undefined))
  }

  function removeTask(taskId: string): Promise<void> {
    return change(() => api.delete(`/tasks/${taskId}`).then(() => undefined))
  }

  function addDependency(taskId: string, dependsOnId: string): Promise<void> {
    return change(() => api.post(`/tasks/${taskId}/dependencies`, { dependsOnId }).then(() => undefined))
  }

  function removeDependency(taskId: string, dependsOnId: string): Promise<void> {
    return change(() =>
      api.delete(`/tasks/${taskId}/dependencies/${dependsOnId}`).then(() => undefined),
    )
  }

  return {
    tasks,
    order,
    hasCycle,
    projectDays,
    loading,
    errorMessage,
    status,
    clear,
    loadPlan,
    createTask,
    saveTask,
    removeTask,
    addDependency,
    removeDependency,
  }
})
