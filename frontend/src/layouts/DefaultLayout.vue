<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AmbientVideo from '@/components/AmbientVideo.vue'

const auth = useAuthStore()
const router = useRouter()

const initial = () => (auth.user?.name?.trim().charAt(0) || 'T').toUpperCase()

async function onLogout(): Promise<void> {
  await auth.logout()
  await router.push('/iniciar-sesion')
}
</script>

<template>
  <div class="stage">
    <AmbientVideo />
    <div class="dock">
      <div class="trigger" aria-hidden="true"></div>
      <aside class="sidebar">
        <RouterLink to="/" class="logo" aria-label="Inicio">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <rect x="2" y="2" width="36" height="36" rx="12" fill="none" stroke="currentColor" stroke-width="1.6" />
            <path d="M12 21.5l5 5 11-12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Inicio</span>
        </RouterLink>
        <nav>
          <RouterLink to="/" aria-label="Inicio">
            <svg viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="1.4" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" /></svg>
            <span>Inicio</span>
          </RouterLink>
          <RouterLink to="/tareas" aria-label="Tareas">
            <svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h9" /></svg>
            <span>Tareas</span>
          </RouterLink>
          <RouterLink to="/about" aria-label="Acerca de">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 11v5M12 8h.01" /></svg>
            <span>Acerca de</span>
          </RouterLink>
        </nav>
        <button type="button" class="logout" aria-label="Cerrar sesión" @click="onLogout">
          <svg viewBox="0 0 24 24"><path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" /><path d="M15 12H4m0 0 3-3m-3 3 3 3" /></svg>
          <span>Salir</span>
        </button>
      </aside>
    </div>

    <header class="header">
      <div>
        <p class="hello">Bienvenido</p>
        <p class="who">{{ auth.user?.name || 'Invitado' }}</p>
      </div>
      <div class="tools">
        <RouterLink to="/tareas" class="tool" aria-label="Nueva tarea">
          <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        </RouterLink>
        <RouterLink to="/perfil" class="avatar" aria-label="Ver perfil">
          <img v-if="auth.user?.avatarUrl" :src="auth.user.avatarUrl" alt="" />
          <span v-else>{{ initial() }}</span>
        </RouterLink>
      </div>
    </header>

    <main class="stage-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.stage {
  --u: min(100vw / 1357, 100dvh / 871);
  --ink: #fff;
  --glass-line: rgb(255 255 255 / 20%);
  position: fixed;
  inset: 0;
  overflow: hidden;
  color: var(--ink);
  font-family: 'Suisse Intl', Inter, 'Segoe UI', sans-serif;
  background: #03080b;
  --color-heading: #fff;
  --color-text: rgb(255 255 255 / 88%);
  --color-background: transparent;
  --color-background-soft: rgb(255 255 255 / 16%);
  --color-background-mute: rgb(255 255 255 / 10%);
  --color-border: rgb(255 255 255 / 22%);
  --color-accent: #f0b429;
  --color-accent-soft: rgb(240 180 41 / 18%);
  --color-critical: #ffe08a;
  --color-critical-soft: rgb(255 224 138 / 16%);
}

.stage::after {
  content: none;
}

.sidebar,
.header,
.stage-main,
.dock {
  position: absolute;
  z-index: 1;
}

.dock {
  z-index: 3;
  left: 0;
  top: 0;
  bottom: 0;
  width: calc(120 * var(--u));
  pointer-events: none;
}

.trigger {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 18px;
  pointer-events: auto;
}

.trigger::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 22%;
  bottom: 22%;
  width: 3px;
  border-radius: 3px;
  background: rgb(255 255 255 / 70%);
  box-shadow: 0 0 12px rgb(255 255 255 / 45%);
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.dock:hover .trigger::before,
.dock:focus-within .trigger::before {
  opacity: 0;
}

.sidebar {
  left: calc(16 * var(--u));
  top: calc(14 * var(--u));
  bottom: calc(7 * var(--u));
  width: calc(72 * var(--u));
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(22 * var(--u)) 0 calc(18 * var(--u));
  border-radius: calc(26 * var(--u));
  background: linear-gradient(180deg, rgb(255 255 255 / 12.5%), rgb(255 255 255 / 9.2%));
  border: 1px solid var(--glass-line);
  backdrop-filter: blur(calc(18 * var(--u))) saturate(115%);
  pointer-events: auto;
  transform: translate3d(-120%, 0, 0);
  transition: transform 0.62s cubic-bezier(0.16, 1, 0.3, 1);
}

.dock:hover .sidebar,
.dock:focus-within .sidebar {
  transform: translate3d(0, 0, 0);
}

.logo,
nav a,
.logout,
.tool {
  color: #fff;
}

.logo svg,
nav svg,
.logout svg,
.tool svg {
  width: calc(23 * var(--u));
  height: calc(23 * var(--u));
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.logo svg {
  width: calc(40 * var(--u));
  height: calc(40 * var(--u));
}

nav {
  display: flex;
  flex-direction: column;
  gap: calc(28 * var(--u));
  margin-top: calc(48 * var(--u));
}

nav a,
.logout,
.tool {
  display: grid;
  place-items: center;
  opacity: 0.78;
}

.logo,
nav a,
.logout {
  position: relative;
  width: calc(46 * var(--u));
  height: calc(46 * var(--u));
  border-radius: calc(14 * var(--u));
  transition:
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.logo span,
nav a span,
.logout span {
  position: absolute;
  left: calc(100% + 10 * var(--u));
  padding: calc(6 * var(--u)) calc(10 * var(--u));
  border-radius: calc(10 * var(--u));
  background: rgb(8 14 16 / 72%);
  color: #fff;
  font-size: calc(13 * var(--u));
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  pointer-events: auto;
  transform: translate3d(calc(-8 * var(--u)), 0, 0);
  transition:
    opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.logo:hover,
nav a:hover,
.logout:hover,
.logo:focus-visible,
nav a:focus-visible,
.logout:focus-visible {
  transform: translate3d(calc(4 * var(--u)), 0, 0) scale(1.08);
  background: rgb(255 255 255 / 16%);
  opacity: 1;
}

.logo:hover span,
nav a:hover span,
.logout:hover span,
.logo:focus-visible span,
nav a:focus-visible span,
.logout:focus-visible span {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.logout {
  margin-top: auto;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.header {
  top: calc(22 * var(--u));
  left: calc(40 * var(--u));
  right: calc(37 * var(--u));
  height: calc(52 * var(--u));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hello {
  font-size: calc(16 * var(--u));
  color: rgb(255 255 255 / 93%);
}

.who {
  margin-top: calc(6 * var(--u));
  font-size: calc(20 * var(--u));
  font-weight: 700;
  letter-spacing: calc(-0.35 * var(--u));
}

.tools {
  display: flex;
  align-items: center;
  gap: calc(16 * var(--u));
}

.tool,
.avatar {
  width: calc(52 * var(--u));
  height: calc(52 * var(--u));
  border-radius: 50%;
  background: rgb(255 255 255 / 15%);
  border: 1px solid var(--glass-line);
  backdrop-filter: blur(calc(16 * var(--u))) saturate(115%);
}

.avatar {
  display: grid;
  place-items: center;
  overflow: hidden;
  font-weight: 700;
  text-decoration: none;
  color: #f4f6f8;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stage-main {
  left: calc(40 * var(--u));
  right: calc(28 * var(--u));
  top: calc(112 * var(--u));
  bottom: calc(24 * var(--u));
  overflow: auto;
}

@media (max-width: 860px) {
  .stage {
    --u: min(100vw / 430, 1.22px);
    overflow: auto;
  }

  .dock {
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;
    width: auto;
    height: auto;
  }

  .dock::before,
  .trigger::before {
    display: none;
  }

  .sidebar {
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;
    width: auto;
    height: calc(64 * var(--u));
    flex-direction: row;
    border-radius: 0;
    padding: 0 calc(18 * var(--u));
    transform: none;
  }

  .logo span,
  nav a span,
  .logout span {
    display: none;
  }

  nav {
    flex-direction: row;
    margin-top: 0;
    gap: calc(22 * var(--u));
  }

  .logout {
    margin-top: 0;
    margin-left: auto;
  }

  .header,
  .stage-main {
    left: calc(16 * var(--u));
    right: calc(16 * var(--u));
  }

  .header {
    top: calc(16 * var(--u));
  }

  .stage-main {
    top: calc(88 * var(--u));
    bottom: calc(76 * var(--u));
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .logo,
  nav a,
  .logout,
  .logo span,
  nav a span,
  .logout span,
  .dock::before,
  .trigger::before {
    transition: none;
  }
}
</style>
