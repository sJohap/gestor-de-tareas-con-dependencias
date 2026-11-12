<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AmbientVideo from '@/components/AmbientVideo.vue'

const route = useRoute()
const bare = computed(() => route.name === 'login')
</script>

<template>
  <RouterView v-if="bare" />
  <div v-else class="auth-layout">
    <AmbientVideo />
    <RouterLink to="/" class="brand">Gestor de tareas</RouterLink>
    <main class="panel">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem 1rem;
  overflow: hidden;
  background: #03080b;
  color: #f5faf6;
  font-family: 'Suisse Intl', Inter, sans-serif;
  --color-heading: #f5faf6;
  --color-text: #ecf1ef;
  --color-background: rgb(0 0 0 / 28%);
  --color-border: rgb(255 255 255 / 22%);
  --color-accent: #e9e9e9;
}

.brand,
.panel {
  position: relative;
  z-index: 1;
}

.brand {
  font-weight: 600;
  color: #88decc;
}

.panel {
  width: min(420px, 100%);
  padding: 2rem;
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 24px;
  background: rgb(17 16 15 / 45%);
  backdrop-filter: blur(20px);
  color: #f5faf6;
}
</style>
