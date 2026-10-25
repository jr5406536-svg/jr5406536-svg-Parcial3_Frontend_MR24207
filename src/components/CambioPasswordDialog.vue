<template>
  <v-dialog :model-value="abierto" persistent max-width="860">
    <v-card class="dialogo">
      <div class="encabezado">
        <h2>Cambio de contraseña</h2>
        <v-btn icon variant="text" aria-label="Cerrar" @click="cerrar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-form ref="formulario" @submit.prevent="guardar">
        <div class="cuerpo">
          <div class="ilustracion" aria-hidden="true">
            <svg viewBox="0 0 220 220" width="180" height="180">
              <rect x="18" y="36" width="150" height="110" rx="16" fill="#eef3fb" />
              <rect x="36" y="58" width="92" height="8" rx="4" fill="#c5d4ee" />
              <rect x="36" y="76" width="70" height="8" rx="4" fill="#d5e0f3" />
              <circle cx="156" cy="78" r="28" fill="#2d52a8" />
              <path d="M146 78l7 7 14-16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="118" cy="150" r="16" fill="#313945" />
              <path d="M92 206c4-28 18-40 26-40s22 12 26 40" fill="#313945" />
              <path d="M104 168l28 8-6 16" fill="#2d52a8" />
            </svg>
          </div>

          <div class="formulario">
            <p class="aviso">
              Por seguridad, cambia tu contraseña temporal antes de continuar. Este cambio se pide una sola vez en tu cuenta.
            </p>
            <v-alert v-if="error" type="error" variant="tonal" class="mb-3" :text="error" />
            <v-text-field
              v-model="actual"
              label="Contraseña actual"
              :type="verActual ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="verActual ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="[requerido]"
              bg-color="white"
              @click:append-inner="verActual = !verActual"
            />
            <v-text-field
              v-model="nueva"
              label="Nueva contraseña"
              :type="verNueva ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="verNueva ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="[requerido, segura]"
              bg-color="white"
              @click:append-inner="verNueva = !verNueva"
            />
            <v-text-field
              v-model="confirmacion"
              label="Confirme nueva contraseña"
              :type="verConfirmacion ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="verConfirmacion ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="[requerido, coincide]"
              bg-color="white"
              @click:append-inner="verConfirmacion = !verConfirmacion"
            />
          </div>
        </div>
        <div class="pie">
          <v-btn type="submit" variant="outlined" color="white" :loading="guardando">Guardar</v-btn>
          <v-btn variant="outlined" color="white" @click="cerrar">Cerrar</v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { cambiarPassword, logout } from '../services/auth'
import { mensajeError } from '../services/api'

defineProps({
  abierto: { type: Boolean, default: false },
})

const router = useRouter()
const formulario = ref(null)
const actual = ref('')
const nueva = ref('')
const confirmacion = ref('')
const verActual = ref(false)
const verNueva = ref(false)
const verConfirmacion = ref(false)
const error = ref('')
const guardando = ref(false)

const requerido = (valor) => !!valor || 'Este campo es obligatorio.'
const segura = (valor) =>
  /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(valor || '') || 'Use al menos 8 caracteres, con letras y números.'
const coincide = (valor) => valor === nueva.value || 'La confirmación no coincide con la nueva contraseña.'

async function guardar() {
  error.value = ''
  const { valid } = await formulario.value.validate()
  if (!valid) return
  guardando.value = true
  try {
    await cambiarPassword({
      password_actual: actual.value,
      password: nueva.value,
      password_confirmation: confirmacion.value,
    })
  } catch (err) {
    error.value = mensajeError(err)
  } finally {
    guardando.value = false
  }
}

async function cerrar() {
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.dialogo {
  overflow: hidden;
}

.encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px 0 24px;
}

.encabezado h2 {
  margin: 0;
  font-size: 20px;
  color: #313945;
}

.cuerpo {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 24px 8px;
}

.ilustracion {
  flex: 0 0 200px;
  display: flex;
  justify-content: center;
}

.formulario {
  flex: 1;
}

.aviso {
  margin: 0 0 16px;
  text-align: center;
  font-size: 15px;
  line-height: 1.4;
  color: #313945;
}

.pie {
  display: flex;
  justify-content: center;
  gap: 28px;
  padding: 14px 24px 16px;
  background: #2d52a8;
}

@media (max-width: 700px) {
  .cuerpo {
    flex-direction: column;
  }

  .ilustracion {
    flex-basis: auto;
  }
}
</style>
