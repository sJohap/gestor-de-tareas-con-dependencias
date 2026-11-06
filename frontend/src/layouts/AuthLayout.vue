<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="auth-layout">
    <RouterLink to="/" class="brand">Gestor de tareas</RouterLink>
    <main class="panel">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem 1rem;
  background:
    radial-gradient(circle at top, var(--color-accent-soft), transparent 42%),
    var(--color-background);
}

.brand {
  font-weight: 700;
  color: var(--color-heading);
}

.panel {
  width: min(420px, 100%);
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-background-soft);
  box-shadow: 0 18px 40px rgb(18 53 42 / 8%);
}
</style>
