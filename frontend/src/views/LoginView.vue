<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <h1>Iniciar sesión</h1>
    <p>Entra con tu cuenta para ver tus tareas.</p>
    <p>
      ¿No tienes cuenta?
      <RouterLink to="/registro">Regístrate</RouterLink>
    </p>
  </section>
</template>

<style scoped>
h1 {
  margin-bottom: 0.75rem;
  color: var(--color-heading);
}

p + p {
  margin-top: 1rem;
}
</style>
