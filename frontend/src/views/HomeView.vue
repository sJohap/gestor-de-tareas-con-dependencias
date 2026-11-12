<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { executionStateLabels, type Task } from '@/types/task'
import { useTaskStore } from '@/stores/tasks'

const taskStore = useTaskStore()
const { tasks, order, hasCycle, projectDays, loading, errorMessage } = storeToRefs(taskStore)
const criticalTasks = computed(() => tasks.value.filter((task) => task.critical))
const readyCount = computed(() => tasks.value.filter((task) => task.executionState === 'ready').length)
const blockedCount = computed(() => tasks.value.filter((task) => task.executionState === 'blocked').length)

const headline = computed(() => {
  if (loading.value && tasks.value.length === 0) {
    return { first: 'Cargando', second: 'el plan' }
  }
  if (tasks.value.length === 0) {
    return { first: 'Sin tareas', second: 'todavía' }
  }
  if (hasCycle.value) {
    return { first: 'Hay un ciclo', second: 'en el plan' }
  }
  const lead = criticalTasks.value[0]
  return {
    first: lead?.title ?? 'Camino crítico',
    second: `${projectDays.value} días`,
  }
})

const blurb = computed(() => {
  if (loading.value && tasks.value.length === 0) {
    return 'Estamos leyendo el plan de ejecución.'
  }
  if (tasks.value.length === 0) {
    return 'Crea tareas, dales una duración y marca de cuáles dependen. El camino crítico aparece cuando el grafo no tiene ciclos.'
  }
  if (hasCycle.value) {
    return 'Una dependencia cierra un círculo. Quita ese enlace en Tareas para volver a calcular el orden y la holgura.'
  }
  return `${tasks.value.length} tareas en el plan. ${readyCount.value} pueden empezar, ${blockedCount.value} siguen bloqueadas y ${criticalTasks.value.length} están en el camino crítico.`
})

const strip = computed(() => order.value.slice(0, 6))
const railTasks = computed(() => tasks.value.slice(0, 3))

const chart = computed(() => {
  const values = order.value.map((item) => {
    const task = tasks.value.find((entry) => entry.id === item.id)
    return task?.durationDays ?? 1
  })
  if (values.length === 0) {
    return { line: '', fill: '' }
  }
  const width = 835
  const max = Math.max(...values, 1)
  const step = values.length === 1 ? 0 : width / (values.length - 1)
  const points = values.map((value, index) => ({
    x: index * step,
    y: 46 + (1 - value / max) * 130,
  }))
  let line = `M${points[0]?.x ?? 0},${points[0]?.y ?? 80}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    if (!current || !next) {
      continue
    }
    const control = (current.x + next.x) / 2
    line += ` C${control},${current.y} ${control},${next.y} ${next.x},${next.y}`
  }
  return { line, fill: `${line} L835,220 L0,220 Z` }
})

function stateOf(task: Task): string {
  return executionStateLabels[task.executionState]
}

onMounted(() => {
  void taskStore.loadPlan()
})
</script>

<template>
  <section class="board">
    <div class="hero">
      <p class="chip">Plan de ejecución</p>
      <h1>
        <span>{{ headline.first }}</span>
        <span>{{ headline.second }}</span>
      </h1>
      <p class="blurb">{{ blurb }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-else-if="loading">Cargando el plan...</p>
    </div>

    <div class="forecast">
      <div class="temps">
        <p v-if="strip.length === 0">Sin orden todavía</p>
        <p v-for="item in strip" :key="item.id" :class="{ on: item.critical }">
          <strong>{{ item.position }}</strong>
          <span>{{ item.title }}</span>
        </p>
      </div>
      <svg viewBox="0 0 835 230" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="wave-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="white" stop-opacity="0.2" />
            <stop offset="0.5" stop-color="white" stop-opacity="0.95" />
            <stop offset="1" stop-color="white" stop-opacity="0.25" />
          </linearGradient>
          <linearGradient id="wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="white" stop-opacity="0.28" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path :d="chart.fill" fill="url(#wave-fill)" />
        <path class="line" :d="chart.line" />
      </svg>
    </div>

    <aside class="rail">
      <article class="card big">
        <p class="place">Proyecto</p>
        <p class="temp">{{ projectDays }}<i>d</i></p>
        <div class="metrics">
          <span>{{ criticalTasks.length }} críticas</span>
          <span>{{ readyCount }} listas</span>
          <span>{{ blockedCount }} bloqueadas</span>
        </div>
      </article>
      <article v-for="task in railTasks" :key="task.id" class="card row">
        <div>
          <p class="where">{{ task.critical ? 'Camino crítico' : 'Tarea' }}</p>
          <h2>{{ task.title }}</h2>
          <p>{{ stateOf(task) }} · holgura {{ task.slack }} días</p>
        </div>
        <strong>{{ task.durationDays }}d</strong>
      </article>
      <RouterLink v-if="tasks.length === 0" to="/tareas" class="card row link-card">
        Crear la primera tarea
      </RouterLink>
    </aside>
  </section>
</template>

<style scoped>
.board {
  position: relative;
  height: 100%;
  min-height: 100%;
}

.hero {
  max-width: calc(560 * var(--u));
}

.chip {
  display: inline-flex;
  align-items: center;
  height: calc(36 * var(--u));
  padding: 0 calc(15 * var(--u));
  border-radius: calc(18 * var(--u));
  background: rgb(255 255 255 / 17.5%);
  border: 1px solid rgb(255 255 255 / 20%);
  backdrop-filter: blur(calc(16 * var(--u))) saturate(115%);
  font-size: calc(14 * var(--u));
}

h1 {
  margin: calc(18 * var(--u)) 0 calc(12 * var(--u));
  font-family: 'Inter Tight', Inter, sans-serif;
  font-weight: 500;
  font-size: calc(54 * var(--u));
  line-height: 0.98;
  letter-spacing: calc(0.2 * var(--u));
}

h1 span {
  display: block;
}

.blurb,
.error {
  width: min(100%, calc(480 * var(--u)));
  font-size: calc(15 * var(--u));
  line-height: calc(24 * var(--u));
  font-weight: 500;
  color: rgb(255 255 255 / 92%);
}

.forecast {
  position: absolute;
  left: 0;
  right: calc(340 * var(--u));
  bottom: 0;
}

.temps {
  display: flex;
  justify-content: space-between;
  gap: calc(12 * var(--u));
}

.temps p {
  display: flex;
  flex-direction: column;
  gap: calc(4 * var(--u));
  color: rgb(255 255 255 / 82%);
  font-size: calc(14 * var(--u));
}

.temps strong {
  font-size: calc(28 * var(--u));
  font-weight: 400;
}

.temps .on {
  color: #fff;
  font-weight: 600;
}

svg {
  width: 100%;
  height: calc(180 * var(--u));
  margin-top: calc(12 * var(--u));
}

.line {
  fill: none;
  stroke: url(#wave-stroke);
  stroke-width: 3.4;
  stroke-linecap: round;
}

.rail {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: calc(310 * var(--u));
  display: flex;
  flex-direction: column;
  gap: calc(16 * var(--u));
}

.card {
  position: relative;
  overflow: hidden;
  padding: calc(18 * var(--u));
  border-radius: calc(24 * var(--u));
  border: 1px solid rgb(255 255 255 / 20%);
  background: linear-gradient(180deg, rgb(255 255 255 / 20%), rgb(255 255 255 / 23%));
  backdrop-filter: blur(calc(26 * var(--u))) saturate(118%);
  color: #fff;
}

.card::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 38%;
  background: linear-gradient(100deg, transparent, rgb(255 255 255 / 17%), transparent);
  transform: translate3d(-150%, 0, 0) skewX(-18deg);
  animation: sheen 1.15s cubic-bezier(0.22, 0.61, 0.36, 1) 0.6s 1 both;
  pointer-events: none;
}

.big .temp {
  font-family: 'Inter Tight', Inter, sans-serif;
  font-size: calc(78 * var(--u));
  font-weight: 500;
  letter-spacing: calc(-3 * var(--u));
  line-height: 0.9;
}

.big i {
  margin-left: calc(4 * var(--u));
  font-style: normal;
  font-size: calc(28 * var(--u));
}

.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: calc(8 * var(--u));
  margin-top: calc(12 * var(--u));
  color: rgb(255 255 255 / 86%);
  font-size: calc(13 * var(--u));
}

.row {
  min-height: calc(92 * var(--u));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(12 * var(--u));
}

.where {
  font-size: calc(12 * var(--u));
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 72%);
}

.row h2 {
  font-size: calc(18 * var(--u));
}

.row strong {
  font-size: calc(28 * var(--u));
  font-weight: 500;
}

.link-card {
  text-decoration: none;
}

@keyframes sheen {
  from { transform: translate3d(-150%, 0, 0) skewX(-18deg); }
  to { transform: translate3d(260%, 0, 0) skewX(-18deg); }
}

@media (max-width: 860px) {
  .forecast,
  .rail {
    position: static;
    width: auto;
    margin-top: calc(24 * var(--u));
  }

  h1 {
    font-size: calc(40 * var(--u));
  }
}

@media (prefers-reduced-motion: reduce) {
  .card::after {
    animation: none;
    opacity: 0;
  }
}
</style>
