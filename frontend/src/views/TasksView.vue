<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api-error'
import {
  executionStateLabels,
  taskStatusLabels,
  type Task,
  type TaskPlan,
  type TaskStatus,
} from '@/types/task'

const tasks = ref<Task[]>([])
const order = ref<TaskPlan['order']>([])
const hasCycle = ref(false)
const projectDays = ref(0)
const title = ref('')
const description = ref('')
const durationDays = ref(1)
const errorMessage = ref('')
const loading = ref(true)
const submitting = ref(false)
const dependencyTarget = ref<Record<string, string>>({})

const statuses: TaskStatus[] = ['pending', 'in_progress', 'done']

const hasTasks = computed(() => tasks.value.length > 0)
const criticalCount = computed(() => tasks.value.filter((task) => task.critical).length)

function titleOf(id: string): string {
  return tasks.value.find((task) => task.id === id)?.title ?? 'Tarea eliminada'
}

function otherTasks(taskId: string): Task[] {
  return tasks.value.filter((task) => task.id !== taskId)
}

async function loadTasks(): Promise<void> {
  const response = await api.get<TaskPlan>('/tasks/plan')
  tasks.value = response.data.tasks
  order.value = response.data.order
  hasCycle.value = response.data.hasCycle
  projectDays.value = response.data.projectDays
}

async function onCreate(): Promise<void> {
  errorMessage.value = ''
  submitting.value = true

  try {
    await api.post('/tasks', {
      title: title.value,
      description: description.value,
      durationDays: durationDays.value,
    })
    title.value = ''
    description.value = ''
    durationDays.value = 1
    await loadTasks()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

async function saveTask(task: Task, patch: Partial<Pick<Task, 'status' | 'durationDays'>>): Promise<void> {
  errorMessage.value = ''

  try {
    await api.patch(`/tasks/${task.id}`, {
      title: task.title,
      description: task.description ?? '',
      status: patch.status ?? task.status,
      durationDays: patch.durationDays ?? task.durationDays,
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
      <div>
        <p class="eyebrow">Plan de trabajo</p>
        <h1>Tareas</h1>
        <p>Define la duración, engancha dependencias y mira cuál es el camino crítico.</p>
      </div>
      <div v-if="hasTasks && !hasCycle" class="summary">
        <span><strong>{{ projectDays }}</strong> días del proyecto</span>
        <span><strong>{{ criticalCount }}</strong> en el camino crítico</span>
      </div>
    </header>

    <form class="card composer" @submit.prevent="onCreate">
      <label>
        Título
        <input v-model="title" type="text" maxlength="120" required />
      </label>
      <label>
        Duración en días
        <input v-model.number="durationDays" type="number" min="1" max="365" required />
      </label>
      <label class="wide">
        Descripción
        <textarea v-model="description" rows="2" maxlength="500"></textarea>
      </label>
      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Guardando...' : 'Crear tarea' }}
      </button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="hasCycle" class="error">Hay un ciclo en las dependencias. El camino crítico no se puede calcular.</p>

    <section v-if="!loading && order.length > 0" class="card order">
      <h2>Orden de ejecución</h2>
      <ol>
        <li v-for="item in order" :key="item.id" :class="{ critical: item.critical }">
          <span>{{ item.title }}</span>
          <small v-if="item.critical">Crítica</small>
        </li>
      </ol>
    </section>

    <p v-if="loading">Cargando tareas...</p>
    <p v-else-if="!hasTasks" class="empty">Todavía no hay tareas. Crea la primera arriba.</p>

    <ul v-else class="list">
      <li v-for="task in tasks" :key="task.id" class="card" :class="{ critical: task.critical }">
        <div class="heading">
          <div>
            <h2>{{ task.title }}</h2>
            <p v-if="task.description" class="description">{{ task.description }}</p>
          </div>
          <span class="badge" :data-state="task.executionState">
            {{ executionStateLabels[task.executionState] }}
          </span>
          <button type="button" class="ghost" @click="onDelete(task)">Eliminar</button>
        </div>

        <dl class="metrics">
          <div>
            <dt>Duración</dt>
            <dd>{{ task.durationDays }} días</dd>
          </div>
          <div>
            <dt>Inicio más pronto</dt>
            <dd>Día {{ task.earliestStart }}</dd>
          </div>
          <div>
            <dt>Fin más tarde</dt>
            <dd>Día {{ task.latestFinish }}</dd>
          </div>
          <div>
            <dt>Holgura</dt>
            <dd>{{ task.slack }} días</dd>
          </div>
        </dl>

        <div class="controls">
          <label>
            Estado
            <select
              :value="task.status"
              @change="saveTask(task, { status: ($event.target as HTMLSelectElement).value as TaskStatus })"
            >
              <option v-for="status in statuses" :key="status" :value="status">
                {{ taskStatusLabels[status] }}
              </option>
            </select>
          </label>
          <label>
            Duración
            <input
              :value="task.durationDays"
              type="number"
              min="1"
              max="365"
              @change="saveTask(task, { durationDays: Number(($event.target as HTMLInputElement).value) })"
            />
          </label>
        </div>

        <div class="deps">
          <h3>Depende de</h3>
          <p v-if="task.dependsOnIds.length === 0" class="muted">Ninguna tarea. Puede empezar al día 0.</p>
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

.intro {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-end;
}

.eyebrow {
  color: var(--color-accent);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  color: var(--color-heading);
}

h1 {
  margin: 0.15rem 0 0.35rem;
}

h2 {
  font-size: 1.15rem;
}

h3 {
  margin-bottom: 0.45rem;
  font-size: 0.95rem;
}

.summary {
  display: flex;
  gap: 0.75rem;
  color: var(--color-heading);
}

.summary span {
  padding: 0.7rem 0.9rem;
  border-radius: 12px;
  border: 1px solid rgb(255 255 255 / 14%);
  background: rgb(32 36 40 / 88%);
  color: #f4f6f8;
  backdrop-filter: blur(12px);
}

.card {
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-background-soft);
}

.card.critical {
  border-color: var(--color-critical);
  box-shadow: inset 3px 0 0 var(--color-critical);
}

.composer {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 0.85rem;
}

.wide,
.composer button {
  grid-column: 1 / -1;
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
  padding: 0.55rem 0.9rem;
  border: 0;
  border-radius: 8px;
  background: var(--color-accent);
  color: white;
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

.order ol {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
}

.order li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  background: var(--color-background-mute);
}

.order li.critical {
  background: var(--color-critical-soft);
  color: var(--color-critical);
}

.order small {
  font-size: 0.75rem;
}

.heading,
.deps li,
.deps form,
.controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.heading {
  justify-content: space-between;
}

.description {
  margin-top: 0.25rem;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
  margin: 1rem 0;
}

.metrics div {
  padding: 0.55rem 0.7rem;
  border-radius: 10px;
  background: var(--color-background);
}

.metrics dt {
  font-size: 0.75rem;
  color: var(--color-text);
}

.metrics dd {
  color: var(--color-heading);
}

.controls {
  align-items: flex-end;
}

.controls label {
  min-width: 140px;
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

.deps li,
.deps form {
  justify-content: space-between;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.badge,
.badge[data-state='ready'],
.badge[data-state='blocked'] {
  margin-left: auto;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 14%);
  background: rgb(32 36 40 / 88%);
  color: #f4f6f8;
  font-size: 0.85rem;
  backdrop-filter: blur(12px);
}

.muted,
.empty {
  color: var(--color-text);
}

.error {
  color: var(--color-critical);
}

@media (max-width: 720px) {
  .intro,
  .summary,
  .composer,
  .metrics,
  .controls,
  .heading {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
