<template>
  <v-app class="fondo-codigo">
    <v-main>
      <v-container class="fill-height" style="max-width: 560px">
        <v-card class="tarjeta pa-8 w-100" rounded="xl">
          <div class="text-center">
            <LogoMarca :size="88" class="mb-6" />
            <p class="instruccion">
              Ingresa el código generado en tu app para tu inicio de sesión
            </p>

            <div v-if="enrolamiento" class="alta mb-6">
              <img :src="enrolamiento.qr" alt="Código para agregar la cuenta en la app" width="148" height="148" />
              <p class="secreto">{{ enrolamiento.secreto }}</p>
              <p class="ayuda">Escanee el código o escriba la clave en su app de autenticación.</p>
            </div>

            <v-alert v-if="error" type="error" variant="tonal" class="mb-4 text-left" :text="error" />

            <form @submit.prevent="entrar">
              <div class="cajas">
                <input
                  v-for="indice in 6"
                  :key="indice"
                  :ref="(el) => (casillas[indice - 1] = el)"
                  :value="digitos[indice - 1]"
                  class="casilla"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="1"
                  :aria-label="`Dígito ${indice}`"
                  @input="escribir(indice - 1, $event)"
                  @keydown="tecla(indice - 1, $event)"
                  @paste="pegar"
                />
              </div>
              <v-btn type="submit" color="secondary" class="mt-6" size="large" :loading="cargando">
                Ingresar
              </v-btn>
            </form>
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import LogoMarca from '../components/LogoMarca.vue'
import { obtenerEnrolamiento, sesion, verificarCodigo } from '../services/auth'
import { mensajeError } from '../services/api'

const router = useRouter()
const digitos = reactive(['', '', '', '', '', ''])
const casillas = []
const error = ref('')
const cargando = ref(false)
const enrolamiento = ref(null)
const codigo = computed(() => digitos.join(''))

function escribir(indice, evento) {
  const valor = evento.target.value.replace(/\D/g, '').slice(-1)
  digitos[indice] = valor
  evento.target.value = valor
  if (valor && indice < 5) {
    casillas[indice + 1]?.focus()
  }
}

function tecla(indice, evento) {
  if (evento.key === 'Backspace' && !digitos[indice] && indice > 0) {
    digitos[indice - 1] = ''
    casillas[indice - 1]?.focus()
  }
}

function pegar(evento) {
  const texto = evento.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) || ''
  if (!texto) return
  evento.preventDefault()
  for (let i = 0; i < 6; i += 1) {
    digitos[i] = texto[i] || ''
  }
  casillas[Math.min(texto.length, 5)]?.focus()
}

async function entrar() {
  error.value = ''
  if (codigo.value.length < 6) {
    error.value = 'Ingrese los 6 dígitos.'
    return
  }
  cargando.value = true
  try {
    await verificarCodigo(codigo.value)
    router.push('/')
  } catch (err) {
    error.value = mensajeError(err)
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  casillas[0]?.focus()
  if (sesion.usuario?.totp_confirmado) return
  try {
    enrolamiento.value = await obtenerEnrolamiento()
  } catch {
    enrolamiento.value = null
  }
})
</script>

<style scoped>
.fondo-codigo {
  background: #f4f7fd !important;
}

.tarjeta {
  background: #e7eef8;
  box-shadow: none;
}

.instruccion {
  max-width: 320px;
  margin: 0 auto 28px;
  font-size: 16px;
  line-height: 1.45;
  color: #313945;
}

.alta img {
  background: #fff;
  border-radius: 12px;
  padding: 8px;
}

.secreto {
  margin: 10px 0 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #2d52a8;
}

.ayuda {
  margin: 4px 0 0;
  font-size: 13px;
  color: #5c6770;
}

.cajas {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.casilla {
  width: 46px;
  height: 52px;
  border: 1px solid #c5d0e0;
  border-radius: 8px;
  background: #fff;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #313945;
}

.casilla:focus {
  outline: 2px solid #2d52a8;
  border-color: #2d52a8;
}
</style>
