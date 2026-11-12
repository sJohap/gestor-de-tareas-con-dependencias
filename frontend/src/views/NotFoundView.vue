<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AmbientVideo from '@/components/AmbientVideo.vue'
</script>

<template>
  <section class="missing">
    <AmbientVideo />
    <div class="copy">
      <h1>Página no encontrada</h1>
      <p>Esa dirección no existe en el gestor.</p>
      <RouterLink to="/">Volver al inicio</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.missing {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #03080b;
  color: #f5faf6;
  font-family: 'Suisse Intl', Inter, sans-serif;
}

.copy {
  position: relative;
  z-index: 1;
  width: min(420px, calc(100% - 2rem));
  padding: 2rem;
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 24px;
  background: rgb(17 16 15 / 45%);
  backdrop-filter: blur(20px);
}

h1 {
  margin-bottom: 0.75rem;
}

p {
  margin-bottom: 1rem;
  color: #ecf1ef;
}

a {
  color: #88decc;
}
</style>
