<template>
  <section class="about">
    <article class="card">
      <p class="eyebrow">El proyecto</p>
      <h1>Acerca de</h1>
      <p>
        Cada tarea tiene una duración. El camino crítico es la cadena más larga: si una de esas
        tareas se atrasa, el proyecto termina más tarde. Las demás tienen holgura.
      </p>
    </article>
  </section>
</template>

<style scoped>
.about {
  display: flex;
  align-items: flex-start;
  min-height: 100%;
  padding-top: calc(12 * var(--u, 1px));
}

.card {
  width: min(640px, 100%);
  padding: calc(28 * var(--u, 1px)) calc(32 * var(--u, 1px));
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: calc(24 * var(--u, 1px));
  background: linear-gradient(180deg, rgb(8 16 18 / 46%), rgb(8 16 18 / 32%));
  backdrop-filter: blur(18px) saturate(120%);
  box-shadow: 0 18px 50px rgb(0 0 0 / 18%);
}

.eyebrow {
  margin-bottom: calc(8 * var(--u, 1px));
  color: #88decc;
  font-size: calc(13 * var(--u, 1px));
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin-bottom: calc(12 * var(--u, 1px));
  color: #f5faf6;
  font-size: calc(40 * var(--u, 1px));
  font-weight: 500;
  line-height: 1;
}

p {
  max-width: 58ch;
  color: rgb(245 250 246 / 92%);
  font-size: calc(16 * var(--u, 1px));
  line-height: 1.55;
}
</style>
