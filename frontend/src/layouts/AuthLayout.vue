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
  background: var(--color-background-soft);
}

.brand {
  font-weight: 600;
  color: var(--color-heading);
}

.panel {
  width: min(420px, 100%);
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
}
</style>
