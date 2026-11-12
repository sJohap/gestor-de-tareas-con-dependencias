<script setup lang="ts">
import { computed, ref } from 'vue'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const name = ref(auth.user?.name ?? '')
const avatarUrl = ref<string | null>(auth.user?.avatarUrl ?? null)
const errorMessage = ref('')
const savedMessage = ref('')
const submitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const initial = computed(() => (name.value.trim().charAt(0) || 'T').toUpperCase())
const roleLabel = computed(() => (auth.user?.role === 'admin' ? 'Administrador' : 'Usuario'))
const since = computed(() => {
  if (!auth.user?.createdAt) {
    return ''
  }
  return new Date(auth.user.createdAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const source = URL.createObjectURL(file)
    image.onload = () => {
      const size = 256
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(source)
        reject(new Error('No se pudo leer la foto'))
        return
      }
      const scale = Math.max(size / image.width, size / image.height)
      const width = image.width * scale
      const height = image.height * scale
      context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height)
      URL.revokeObjectURL(source)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    image.onerror = () => {
      URL.revokeObjectURL(source)
      reject(new Error('La imagen no se pudo abrir'))
    }
    image.src = source
  })
}

async function onPhoto(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  errorMessage.value = ''
  savedMessage.value = ''
  try {
    avatarUrl.value = await readPhoto(file)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo usar esa foto'
  }
}

async function onSave(): Promise<void> {
  errorMessage.value = ''
  savedMessage.value = ''
  submitting.value = true
  try {
    await auth.updateProfile(name.value, avatarUrl.value)
    savedMessage.value = 'Perfil actualizado'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="profile">
    <article class="card">
      <p class="eyebrow">Tu cuenta</p>
      <h1>Perfil</h1>

      <div class="identity">
        <button type="button" class="photo" @click="fileInput?.click()">
          <img v-if="avatarUrl" :src="avatarUrl" alt="Foto de perfil" />
          <span v-else>{{ initial }}</span>
        </button>
        <div>
          <p class="hint">Haz clic en la foto para cambiarla.</p>
          <button type="button" class="text" @click="fileInput?.click()">Elegir imagen</button>
          <button v-if="avatarUrl" type="button" class="text" @click="avatarUrl = null">Quitar foto</button>
        </div>
      </div>
      <input ref="fileInput" class="file" type="file" accept="image/*" @change="onPhoto" />

      <form @submit.prevent="onSave">
        <label>
          Nombre
          <input v-model="name" type="text" maxlength="80" required />
        </label>
        <label>
          Correo
          <input :value="auth.user?.email" type="email" disabled />
        </label>
        <div class="facts">
          <p><span>Rol</span> {{ roleLabel }}</p>
          <p><span>Desde</span> {{ since }}</p>
        </div>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="savedMessage" class="ok">{{ savedMessage }}</p>
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Guardando...' : 'Guardar perfil' }}
        </button>
      </form>
    </article>
  </section>
</template>

<style scoped>
.profile {
  display: flex;
  min-height: 100%;
  padding-top: calc(8 * var(--u, 1px));
}

.card {
  width: min(560px, 100%);
  padding: calc(28 * var(--u, 1px)) calc(32 * var(--u, 1px));
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: calc(24 * var(--u, 1px));
  background: linear-gradient(180deg, rgb(8 16 18 / 46%), rgb(8 16 18 / 32%));
  backdrop-filter: blur(18px) saturate(120%);
  color: #f5faf6;
}

.eyebrow {
  margin-bottom: calc(8 * var(--u, 1px));
  color: #88decc;
  font-size: calc(13 * var(--u, 1px));
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin-bottom: calc(18 * var(--u, 1px));
  font-size: calc(40 * var(--u, 1px));
  font-weight: 500;
  line-height: 1;
}

.identity {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.photo {
  width: 92px;
  height: 92px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 24%);
  border-radius: 50%;
  overflow: hidden;
  background: rgb(32 36 40 / 88%);
  color: #f4f6f8;
  font-size: 2rem;
  cursor: pointer;
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hint {
  color: rgb(245 250 246 / 78%);
}

.text {
  margin-right: 0.8rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: #88decc;
  cursor: pointer;
}

.file {
  display: none;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

input {
  padding: 0.7rem 0.8rem;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 12px;
  background: rgb(0 0 0 / 28%);
  color: #f5faf6;
  font: inherit;
}

input:disabled {
  opacity: 0.7;
}

.facts {
  display: flex;
  gap: 1.5rem;
}

.facts span {
  display: block;
  color: rgb(245 250 246 / 62%);
  font-size: 0.8rem;
}

button[type='submit'] {
  width: fit-content;
  margin-top: 0.3rem;
  padding: 0.7rem 1rem;
  border: 0;
  border-radius: 999px;
  background: #e9e9e9;
  color: #0a0707;
  font-weight: 650;
  cursor: pointer;
}

button[type='submit']:disabled {
  opacity: 0.7;
  cursor: wait;
}

.error {
  color: #ffb4a2;
}

.ok {
  color: #88decc;
}
</style>
