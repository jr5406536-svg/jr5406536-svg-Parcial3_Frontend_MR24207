<template>
  <v-app class="login-fondo">
    <v-main>
      <v-container class="fill-height" style="max-width: 440px">
        <div class="w-100 text-center">
          <LogoMarca :size="96" class="mb-4" />
          <h1 class="titulo-acceso">Sistema de Gestión de Constancias</h1>
          <p class="subtitulo-2 mb-6">
            Ingrese su correo electrónico y contraseña para acceder a su cuenta
          </p>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4 text-left" :text="error" />

          <v-form @submit.prevent="entrar">
            <v-text-field
              v-model="email"
              label="Correo electrónico"
              type="email"
              prepend-inner-icon="mdi-account-outline"
              :rules="[requerido, correoValido]"
              class="mb-1 text-left"
              bg-color="white"
            />
            <v-text-field
              v-model="password"
              label="Contraseña"
              :type="ver ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="ver ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="[requerido]"
              class="text-left"
              bg-color="white"
              @click:append-inner="ver = !ver"
            />
            <v-btn
              type="submit"
              color="secondary"
              block
              size="large"
              class="mt-2"
              :loading="cargando"
            >
              Ingresar
            </v-btn>
          </v-form>

          <button type="button" class="enlace-recuperar" @click="recuperar = true">
            Recupera tu contraseña
          </button>
          <p class="pie">Gestión y administración de Constancias.</p>
        </div>
      </v-container>
    </v-main>

    <v-dialog v-model="recuperar" max-width="420">
      <v-card class="pa-2">
        <v-card-title class="titulo-6">Recupera tu contraseña</v-card-title>
        <v-card-text class="cuerpo-1">
          Para restablecer el acceso, comuníquese con el administrador del sistema.
          Esta aplicación no envía un enlace de recuperación.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" @click="recuperar = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LogoMarca from '../components/LogoMarca.vue'
import { login } from '../services/auth'
import { mensajeError } from '../services/api'

const router = useRouter()
const email = ref('')
const password = ref('')
const ver = ref(false)
const error = ref('')
const cargando = ref(false)
const recuperar = ref(false)

const requerido = (valor) => !!valor || 'Este campo es obligatorio.'
const correoValido = (valor) => /.+@.+\..+/.test(valor || '') || 'El correo no es válido.'

async function entrar() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Escriba el correo y la contraseña.'
    return
  }
  cargando.value = true
  try {
    const data = await login(email.value, password.value)
    router.push(data.paso === 'codigo' ? '/verificar' : '/')
  } catch (err) {
    error.value = mensajeError(err)
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-fondo {
  background: #ffffff !important;
}

.titulo-acceso {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
  color: #2d52a8;
  margin-bottom: 8px;
}

.enlace-recuperar {
  margin-top: 16px;
  background: none;
  border: 0;
  color: #2d52a8;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.pie {
  margin-top: 8px;
  font-size: 13px;
  color: #7a8694;
}
</style>
