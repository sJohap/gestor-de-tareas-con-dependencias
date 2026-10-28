<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api-error'
import { taskStatusLabels, type Task, type TaskStatus } from '@/types/task'

const tasks = ref<Task[]>([])
const title = ref('')
const description = ref('')
const errorMessage = ref('')
const loading = ref(true)
const submitting = ref(false)
const dependencyTarget = ref<Record<string, string>>({})

const statuses: TaskStatus[] = ['pending', 'in_progress', 'done']

const hasTasks = computed(() => tasks.value.length > 0)

function titleOf(id: string): string {
  return tasks.value.find((task) => task.id === id)?.title ?? 'Tarea eliminada'
}

function otherTasks(taskId: string): Task[] {
  return tasks.value.filter((task) => task.id !== taskId)
}

async function loadTasks(): Promise<void> {
  const response = await api.get<{ tasks: Task[] }>('/tasks')
  tasks.value = response.data.tasks
}

async function onCreate(): Promise<void> {
  errorMessage.value = ''
  submitting.value = true

  try {
    await api.post('/tasks', {
      title: title.value,
      description: description.value,
    })
    title.value = ''
    description.value = ''
    await loadTasks()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function onStatusChange(task: Task, status: TaskStatus): Promise<void> {
  errorMessage.value = ''

  try {
    await api.patch(`/tasks/${task.id}`, {
      title: task.title,
      description: task.description ?? '',
      status,
    })
    await loadTasks()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  }
}

async function onDelete(task: Task): Promise<void> {
  if (!window.confirm(`¿Eliminar "${task.title}"?`)) {
    return
  }

  errorMessage.value = ''

  try {
    await api.delete(`/tasks/${task.id}`)
    await loadTasks()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  }
}

async function onAddDependency(task: Task): Promise<void> {
  const dependsOnId = dependencyTarget.value[task.id]

  if (!dependsOnId) {
    return
  }

  errorMessage.value = ''

  try {
    await api.post(`/tasks/${task.id}/dependencies`, { dependsOnId })
    dependencyTarget.value[task.id] = ''
    await loadTasks()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  }
}

async function onRemoveDependency(task: Task, dependsOnId: string): Promise<void> {
  errorMessage.value = ''

  try {
    await api.delete(`/tasks/${task.id}/dependencies/${dependsOnId}`)
    await loadTasks()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  }
}

onMounted(async () => {
  try {
    await loadTasks()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="tasks">
    <header class="intro">
      <h1>Tareas</h1>
      <p>Crea una tarea y marca de cuáles tiene que esperar.</p>
    </header>

    <form class="card composer" @submit.prevent="onCreate">
      <label>
        Título
        <input v-model="title" type="text" maxlength="120" required />
      </label>
      <label>
        Descripción
        <textarea v-model="description" rows="3" maxlength="500"></textarea>
      </label>
      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Guardando...' : 'Crear tarea' }}
      </button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading">Cargando tareas...</p>
    <p v-else-if="!hasTasks" class="empty">Todavía no hay tareas.</p>

    <ul v-else class="list">
      <li v-for="task in tasks" :key="task.id" class="card">
        <div class="heading">
          <h2>{{ task.title }}</h2>
          <button type="button" class="ghost" @click="onDelete(task)">Eliminar</button>
        </div>
        <p v-if="task.description">{{ task.description }}</p>
        <label class="status">
          Estado
          <select
            :value="task.status"
            @change="onStatusChange(task, ($event.target as HTMLSelectElement).value as TaskStatus)"
          >
            <option v-for="status in statuses" :key="status" :value="status">
              {{ taskStatusLabels[status] }}
            </option>
          </select>
        </label>

        <div class="deps">
          <h3>Depende de</h3>
          <p v-if="task.dependsOnIds.length === 0" class="muted">Ninguna tarea.</p>
          <ul v-else>
            <li v-for="dependsOnId in task.dependsOnIds" :key="dependsOnId">
              <span>{{ titleOf(dependsOnId) }}</span>
              <button type="button" class="ghost" @click="onRemoveDependency(task, dependsOnId)">
                Quitar
              </button>
            </li>
          </ul>
          <form v-if="otherTasks(task.id).length > 0" @submit.prevent="onAddDependency(task)">
            <select v-model="dependencyTarget[task.id]">
              <option value="">Elegir tarea</option>
              <option v-for="other in otherTasks(task.id)" :key="other.id" :value="other.id">
                {{ other.title }}
              </option>
            </select>
            <button type="submit">Agregar</button>
          </form>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.tasks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h1,
h2,
h3 {
  color: var(--color-heading);
}

h1 {
  margin-bottom: 0.35rem;
}

h2 {
  font-size: 1.15rem;
}

h3 {
  margin-bottom: 0.45rem;
  font-size: 0.95rem;
}

.card {
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
}

.composer,
.deps form,
.status {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.composer {
  gap: 0.85rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--color-heading);
}

input,
textarea,
select {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
}

button {
  width: fit-content;
  padding: 0.55rem 0.8rem;
  border: 0;
  border-radius: 8px;
  background: hsla(160, 100%, 37%, 1);
  color: #fff;
  cursor: pointer;
}

button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.ghost {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.heading,
.deps li,
.deps form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.deps {
  margin-top: 1rem;
}

.deps ul {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  padding: 0;
  list-style: none;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.status {
  max-width: 220px;
  margin-top: 0.85rem;
}

.muted,
.empty {
  color: var(--color-text);
}

.error {
  color: #b42318;
}
</style>
