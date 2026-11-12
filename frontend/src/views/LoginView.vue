<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth'

const BAR_HEIGHTS = [
  23, 40, 53, 40, 33, 14, 7, 17, 75, 65, 88, 75, 65, 47, 33, 88, 4, 7, 9, 14, 95, 65, 79,
  37, 7, 40, 17, 20, 62, 47, 92, 72,
]

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)
const menuOpen = ref(false)
const emailInput = ref<HTMLInputElement | null>(null)

const maxHeight = Math.max(...BAR_HEIGHTS)
const axis = ['10:00', '12:00', '14:00', '16:00', '16:00']
const links = ['Inicio', 'Tareas', 'Plan', 'Cuenta']

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibility, { passive: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  document.body.style.overflow = ''
})

function onVisibility(): void {
  document.documentElement.classList.toggle('animations-paused', document.hidden)
}

function focusLogin(): void {
  menuOpen.value = false
  emailInput.value?.focus()
}

function goRegister(): void {
  menuOpen.value = false
  void router.push('/registro')
}

async function onSubmit(): Promise<void> {
  errorMessage.value = ''
  submitting.value = true

  try {
    await auth.login(email.value, password.value)
    await router.push('/')
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="hero">
    <video
        class="video"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260813_092641_de52eb87-daf2-41db-92cb-7a56eae012a5.mp4"
        autoplay
        loop
        muted
        playsinline
        preload="auto"
    ></video>

    <div class="content">
      <nav class="nav">
        <div class="reveal down" style="animation-delay: 0ms">
          <div class="logo">
            <svg width="28" height="28" viewBox="0 0 256 256" fill="none" aria-hidden="true">
              <path
                fill="#fff"
                d="M 256 256 L 178 256 C 150.386 256 128 233.614 128 206 L 128 256 L 0 256 L 0 192 C 0 156.654 28.654 128 64 128 C 99.346 128 128 156.654 128 192 L 128 128 L 256 128 Z M 78 0 C 105.614 0 128 22.386 128 50 L 128 0 L 256 0 L 256 64 C 256 99.346 227.346 128 192 128 C 156.654 128 128 99.346 128 64 L 128 128 L 0 128 L 0 0 Z"
              />
            </svg>
            <span>Gestor</span>
          </div>
        </div>

        <div class="reveal down desktop-pill" style="animation-delay: 100ms">
          <div class="center-pill">
            <button type="button" @click="focusLogin">
              Tareas
              <svg viewBox="0 0 24 24" class="chev"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <span>Plan</span>
            <span>Holguras</span>
            <button type="button" @click="goRegister">Cuenta</button>
          </div>
        </div>

        <div class="reveal down desktop-pill" style="animation-delay: 200ms">
          <div class="auth-pill">
            <button type="button" class="login-nav" @click="focusLogin">Entrar</button>
            <button type="button" class="demo-nav" @click="goRegister">Crear cuenta</button>
          </div>
        </div>

        <div class="reveal down mobile-only" style="animation-delay: 100ms">
          <button
            type="button"
            class="burger"
            aria-label="Abrir menú"
            @click="menuOpen = !menuOpen"
          >
            <span class="burger-icons">
              <svg viewBox="0 0 24 24" :class="{ hide: menuOpen }"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              <svg viewBox="0 0 24 24" :class="{ show: menuOpen }"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </span>
          </button>
        </div>
      </nav>

      <div class="stage">
        <div class="row">
          <div class="copy">
            <h1 class="reveal up" style="animation-delay: 300ms">
              Eleva tus tareas al camino crítico
            </h1>
            <p class="reveal up sub" style="animation-delay: 500ms">
              Dependencias, orden de ejecución y holguras, calculadas en un solo plan.
            </p>
            <div class="reveal up actions" style="animation-delay: 700ms">
              <button type="button" class="solid" @click="focusLogin">Iniciar sesión</button>
              <button type="button" class="ghost" @click="goRegister">Crear cuenta</button>
            </div>
          </div>

          <div class="reveal scale card-wrap" style="animation-delay: 900ms">
            <form class="card" @submit.prevent="onSubmit">
              <p class="card-label">Iniciar sesión</p>
              <label>
                Correo
                <input ref="emailInput" v-model="email" type="email" autocomplete="email" required />
              </label>
              <label>
                Contraseña
                <input v-model="password" type="password" autocomplete="current-password" required />
              </label>
              <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
              <button type="submit" class="solid wide" :disabled="submitting">
                {{ submitting ? 'Entrando...' : 'Entrar' }}
              </button>

              <div class="chart">
                <div class="bars">
                  <span
                    v-for="(height, index) in BAR_HEIGHTS"
                    :key="index"
                    class="bar"
                    :style="{
                      height: `${(height / maxHeight) * 100}%`,
                      animationDelay: `${1100 + index * 30}ms`,
                    }"
                  >
                    <i
                      :style="{
                        backgroundColor: index >= 28 ? 'rgba(255,255,255,0.1)' : 'white',
                        animationDelay: `${2050 + index * 30}ms`,
                      }"
                    ></i>
                  </span>
                </div>
                <div class="grid">
                  <span v-for="line in 5" :key="line" :style="{ left: `${(line / 5) * 100}%` }"></span>
                </div>
                <div class="axis">
                  <span
                    v-for="(label, index) in axis"
                    :key="`${label}-${index}`"
                    :style="{ opacity: index >= 3 ? 0.4 : 1 }"
                  >
                    {{ label }}
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="overlay" :class="{ open: menuOpen }">
      <button type="button" class="backdrop" aria-label="Cerrar menú" @click="menuOpen = false"></button>
      <div class="sheet" :class="{ open: menuOpen }">
        <button
          v-for="(link, index) in links"
          :key="link"
          type="button"
          class="sheet-link"
          :style="{ transitionDelay: menuOpen ? `${100 + index * 50}ms` : '0ms' }"
          @click="link === 'Cuenta' ? goRegister() : focusLogin()"
        >
          {{ link }}
        </button>
        <div class="rule"></div>
        <button type="button" class="solid wide" @click="goRegister">Crear cuenta</button>
        <button type="button" class="ghost wide" @click="focusLogin">Entrar</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #080a19;
  font-family: 'Suisse Intl', Inter, sans-serif;
  color: #fff;
}

.video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: translate3d(0, 0, 0) scale(1.04);
  animation: video-in 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.content {
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav,
.row {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  position: relative;
  z-index: 50;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo span {
  font-size: 22px;
  font-weight: 450;
  letter-spacing: -0.02em;
  line-height: 1;
}

.logo svg {
  width: 28px;
  height: 28px;
}

.center-pill,
.auth-pill,
.burger {
  background: rgb(10 7 7 / 35%);
  backdrop-filter: blur(17px);
}

.center-pill {
  display: none;
  height: 52px;
  padding: 0 24px;
  align-items: center;
  gap: 30px;
  border-radius: 11px;
  color: rgb(255 255 255 / 80%);
  font-size: 14px;
  font-weight: 450;
}

.center-pill button,
.auth-pill button,
.burger,
.solid,
.ghost,
.sheet-link {
  font: inherit;
  cursor: pointer;
  transition:
    opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.solid:hover,
.ghost:hover,
.demo-nav:hover,
.login-nav:hover,
.center-pill button:hover {
  transform: translate3d(0, -1px, 0);
}

.solid:hover { opacity: 0.92; }
.ghost:hover,
.login-nav:hover { opacity: 0.82; }

.center-pill button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  background: transparent;
  color: inherit;
}

.chev {
  width: 10px;
  height: 10px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.auth-pill {
  display: none;
  height: 52px;
  padding: 3px;
  border-radius: 13px;
  align-items: center;
  gap: 5px;
  background: rgb(0 0 0 / 35%);
}

.login-nav,
.demo-nav {
  height: 46px;
  padding: 0 24px;
  border-radius: 11px;
  border: 0;
  font-size: 14px;
  font-weight: 450;
}

.login-nav {
  background: transparent;
  color: #fff;
}

.demo-nav,
.solid {
  background: #e9e9e9;
  color: #0a0707;
}

.burger {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 11px;
  display: grid;
  place-items: center;
}

.burger-icons {
  position: relative;
  width: 20px;
  height: 20px;
}

.burger svg {
  position: absolute;
  inset: 0;
  width: 20px;
  height: 20px;
  fill: none;
  stroke: #fff;
  stroke-width: 1.8;
  stroke-linecap: round;
  transition: all 0.3s ease-out;
}

.burger svg.hide {
  opacity: 0;
  transform: rotate(90deg) scale(0.75);
}

.burger svg.show {
  opacity: 1;
  transform: none;
}

.burger svg:last-child {
  opacity: 0;
  transform: rotate(-90deg) scale(0.75);
}

.stage {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 32px 0;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.copy {
  max-width: 593px;
}

h1 {
  margin: 0 0 20px;
  color: #fff;
  font-size: 36px;
  font-weight: 400;
  line-height: 0.95;
}

.sub {
  max-width: 370px;
  margin: 0 0 28px;
  color: rgb(255 255 255 / 80%);
  font-size: 16px;
  font-weight: 450;
  line-height: 1.3;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.solid,
.ghost {
  height: 46px;
  padding: 0 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 450;
}

.ghost {
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
}

.wide {
  width: 100%;
}

.card-wrap {
  width: 100%;
  max-width: 405px;
  margin: 0 auto;
}

.card {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 20px 20px 20px;
  border-radius: 24px;
  background: rgb(17 16 15 / 35%);
  backdrop-filter: blur(20px);
}

.card::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 42%;
  pointer-events: none;
  background: linear-gradient(100deg, transparent, rgb(255 255 255 / 18%), transparent);
  animation: sheen 4.6s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
}

.card-label {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 450;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  color: rgb(255 255 255 / 80%);
  font-size: 14px;
  font-weight: 450;
}

input {
  height: 46px;
  padding: 0 14px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 12px;
  background: rgb(0 0 0 / 28%);
  color: #fff;
  font: inherit;
  transition:
    border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

input:focus {
  outline: none;
  border-color: rgb(255 255 255 / 48%);
  background: rgb(0 0 0 / 42%);
}

.card .solid {
  margin: 4px 0 24px;
}

.error {
  margin: -4px 0 10px;
  color: #ffb4a2;
  font-size: 14px;
}

.chart {
  position: relative;
  contain: layout paint;
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 1.5px;
  height: 80px;
}

.bar {
  flex: 1;
  display: flex;
  align-items: flex-end;
  border-radius: 0.5px;
  transform-origin: bottom;
  animation: bar-grow 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

.bar i {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  transform-origin: bottom;
  animation: bar-wave 2.8s ease-in-out infinite alternate;
}

.grid {
  position: absolute;
  inset: 0 0 22px;
  pointer-events: none;
}

.grid span {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgb(255 255 255 / 10%);
}

.axis {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  color: rgb(255 255 255 / 80%);
  font-size: 9px;
  font-weight: 450;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  visibility: hidden;
  transition: visibility 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.overlay.open {
  visibility: visible;
}

.backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgb(8 10 25 / 90%);
  backdrop-filter: blur(24px);
  opacity: 0;
  transition: opacity 0.5s;
}

.overlay.open .backdrop {
  opacity: 1;
}

.sheet {
  position: absolute;
  top: 76px;
  left: 16px;
  right: 16px;
  padding: 24px;
  border: 1px solid rgb(255 255 255 / 6%);
  border-radius: 20px;
  background: rgb(17 16 15 / 60%);
  backdrop-filter: blur(30px);
  opacity: 0;
  transform: translate3d(0, -16px, 0) scale(0.97);
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet.open {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

.sheet-link {
  display: flex;
  width: 100%;
  margin-bottom: 4px;
  padding: 16px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: rgb(255 255 255 / 90%);
  font-size: 18px;
  font-weight: 450;
  text-align: left;
  opacity: 0;
  transform: translate3d(-12px, 0, 0);
  transition:
    opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet.open .sheet-link {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.rule {
  height: 1px;
  margin: 20px 0;
  background: rgb(255 255 255 / 10%);
}

.reveal {
  opacity: 0;
  animation-duration: 1.15s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: forwards;
  will-change: auto;
}

.up { animation-name: fade-up; }
.down { animation-name: fade-down; animation-duration: 1s; }
.scale { animation-name: fade-scale; animation-duration: 1.25s; }

.desktop-pill { display: none; }
.mobile-only { display: block; }

@media (max-width: 1023px) {
  .hero {
    height: auto;
    min-height: 100vh;
    overflow: auto;
  }

  .content {
    height: auto;
    min-height: 100vh;
  }
}

@media (min-width: 640px) {
  .nav,
  .row { padding-left: 32px; padding-right: 32px; }
  .nav { padding-top: 30px; }
  h1 { margin-bottom: 32px; font-size: 52px; }
  .sub { margin-bottom: 40px; font-size: 18px; }
  .actions { gap: 16px; }
  .solid, .ghost { height: 51px; padding: 0 27px; font-size: 15.5px; }
  .logo span { font-size: 26px; }
  .logo svg { width: 32px; height: 32px; }
  .card { padding: 32px 32px 24px; border-radius: 33px; }
  .card-label { margin-bottom: 16px; font-size: 20px; }
  .card .solid { margin-bottom: 32px; }
  .bars { height: 100px; }
  .axis { font-size: 10px; }
  .sheet { top: 86px; left: 24px; right: 24px; padding: 32px; }
}

@media (min-width: 768px) {
  .nav, .row { padding-left: 82px; padding-right: 82px; }
  h1 { font-size: 64px; }
  .sub { font-size: 20px; }
}

@media (min-width: 1024px) {
  .row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
  }

  h1 { font-size: 72px; }
  .card-wrap { margin: 0; }
  .desktop-pill { display: block; }
  .mobile-only, .overlay { display: none; }
  .center-pill, .auth-pill { display: flex; }
}

@keyframes video-in {
  from { opacity: 0; transform: translate3d(0, 0, 0) scale(1.035); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}
:global(html.animations-paused) .bar,
:global(html.animations-paused) .bar i,
:global(html.animations-paused) .card::after {
  animation-play-state: paused;
}

@keyframes fade-up {
  from { opacity: 0; transform: translate3d(0, 18px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes fade-down {
  from { opacity: 0; transform: translate3d(0, -14px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes fade-scale {
  from { opacity: 0; transform: translate3d(0, 0, 0) scale(0.96); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes bar-grow {
  from { transform: translate3d(0, 0, 0) scaleY(0); opacity: 0; }
  to { transform: translate3d(0, 0, 0) scaleY(1); opacity: 1; }
}
@keyframes bar-wave {
  from { transform: scaleY(1); }
  to { transform: scaleY(0.84); }
}
@keyframes sheen {
  from { transform: translate3d(-170%, 0, 0) skewX(-18deg); }
  to { transform: translate3d(280%, 0, 0) skewX(-18deg); }
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .bar,
  .bar i,
  .video,
  .card::after { animation: none; opacity: 1; transform: none; }
}
</style>
