<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function onLogout(): Promise<void> {
  await auth.logout()
  await router.push('/iniciar-sesion')
}
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <RouterLink to="/" class="brand">Gestor de tareas</RouterLink>
      <nav>
        <RouterLink to="/">Inicio</RouterLink>
        <RouterLink to="/tareas">Tareas</RouterLink>
        <RouterLink to="/about">Acerca de</RouterLink>
        <RouterLink v-if="!auth.isAuthenticated" to="/iniciar-sesion">Iniciar sesión</RouterLink>
        <template v-else>
          <span class="who">{{ auth.user?.name }}</span>
          <button type="button" @click="onLogout">Cerrar sesión</button>
        </template>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.brand {
  font-weight: 600;
  color: var(--color-heading);
}

nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

nav a,
.who {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  color: var(--color-text);
}

nav a.router-link-exact-active {
  color: var(--color-heading);
  background: var(--color-background-mute);
}

button {
  margin-left: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.content {
  flex: 1;
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
</style>
