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
  padding: 0.9rem 1.5rem;
  background: var(--color-topbar);
  color: var(--color-topbar-text);
}

.brand {
  font-weight: 700;
  color: var(--color-topbar-text);
}

nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

nav a,
.who {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  color: var(--color-topbar-text);
}

nav a.router-link-exact-active {
  background: rgb(255 255 255 / 14%);
}

button {
  margin-left: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 999px;
  background: transparent;
  color: var(--color-topbar-text);
  cursor: pointer;
}

.content {
  flex: 1;
  width: min(1040px, 100%);
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}
</style>
