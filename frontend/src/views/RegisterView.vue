<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section>
    <h1>Crear cuenta</h1>
    <p>Regístrate para empezar a organizar tus tareas.</p>
    <p>
      ¿Ya tienes cuenta?
      <RouterLink to="/iniciar-sesion">Inicia sesión</RouterLink>
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
