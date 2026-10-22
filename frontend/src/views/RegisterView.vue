<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)

async function onSubmit(): Promise<void> {
  errorMessage.value = ''
  submitting.value = true

  try {
    await auth.register(name.value, email.value, password.value)
    await router.push('/')
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section>
    <h1>Crear cuenta</h1>
    <p>Regístrate para empezar a organizar tus tareas.</p>

    <form @submit.prevent="onSubmit">
      <label>
        Nombre
        <input v-model="name" type="text" autocomplete="name" required />
      </label>
      <label>
        Correo
        <input v-model="email" type="email" autocomplete="email" required />
      </label>
      <label>
        Contraseña
        <input v-model="password" type="password" autocomplete="new-password" required />
      </label>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Creando cuenta...' : 'Crear cuenta' }}
      </button>
    </form>

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

form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 1.25rem 0;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--color-heading);
}

input {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
}

button {
  margin-top: 0.25rem;
  padding: 0.6rem 0.8rem;
  border: 0;
  border-radius: 8px;
  background: hsla(160, 100%, 37%, 1);
  color: #fff;
  cursor: pointer;
}

button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.error {
  color: #b42318;
}
</style>
