<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <section>
    <h1>Gestor de tareas con dependencias</h1>
    <p v-if="auth.user">Hola, {{ auth.user.name }}. Tu sesión está activa.</p>
    <p>
      Registra tareas, define de cuáles dependen y consulta cuáles están listas para empezar.
    </p>
  </section>
</template>

<style scoped>
h1 {
  margin-bottom: 0.75rem;
  color: var(--color-heading);
}

p + p {
  margin-top: 0.75rem;
}
</style>
