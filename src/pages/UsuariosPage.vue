<template>
  <div>
    <h1 class="titulo-6 mb-1">Usuarios</h1>
    <p class="subtitulo-2 mb-4">
      Usa a una persona que ya tiene constancia, o crea una cuenta nueva. No hace falta la cuenta Registrador.
    </p>

    <v-alert v-if="mensaje" :type="tipo" variant="tonal" class="mb-4" :text="mensaje" />

    <v-card v-if="disponibles.length" class="pa-6 mb-6" border>
      <h2 class="titulo-6 mb-1">Personas que ya tienen constancia</h2>
      <p class="subtitulo-2 mb-4">
        Elige una. Solo te falta ponerle la contraseña temporal. Sus solicitudes con ese correo quedan en su cuenta.
      </p>
      <v-row>
        <v-col cols="12" md="8">
          <v-select
            v-model="personaElegida"
            :items="disponibles"
            item-title="name"
            item-value="email"
            label="Persona ya registrada"
            return-object
          />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <v-btn color="secondary" :disabled="!personaElegida" @click="usarPersona">Usar esta persona</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="pa-6 mb-6" border>
      <h2 class="titulo-6 mb-4">{{ form.email ? 'Cuenta para ' + form.name : 'O crea una persona nueva' }}</h2>
      <v-form ref="formulario" @submit.prevent="guardar">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.name" label="Nombre" :rules="[requerido, largo]" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.email" label="Correo" type="email" :rules="[requerido, correoValido]" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.password"
              label="Contraseña temporal"
              :type="ver ? 'text' : 'password'"
              :append-inner-icon="ver ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="[requerido, segura]"
              @click:append-inner="ver = !ver"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.password_confirmation"
              label="Confirme la contraseña"
              :type="ver ? 'text' : 'password'"
              :rules="[requerido, coincide]"
            />
          </v-col>
        </v-row>
        <v-btn type="submit" color="secondary" :loading="guardando">Crear usuario</v-btn>
      </v-form>
    </v-card>

    <div class="tabla-scroll">
      <v-table class="tabla-estandar">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cargando">
            <td colspan="2" class="text-center py-6">Cargando...</td>
          </tr>
          <tr v-else-if="!usuarios.length">
            <td colspan="2" class="text-center py-6">Todavía no hay usuarios.</td>
          </tr>
          <tr v-else v-for="persona in usuarios" :key="persona.id">
            <td>{{ persona.name }}</td>
            <td>{{ persona.email }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { crear, listar } from '../services/usuarios'
import { mensajeError } from '../services/api'

const formulario = ref(null)
const usuarios = ref([])
const disponibles = ref([])
const personaElegida = ref(null)
const cargando = ref(false)
const guardando = ref(false)
const mensaje = ref('')
const tipo = ref('success')
const ver = ref(false)
const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const requerido = (valor) => !!valor || 'Este campo es obligatorio.'
const largo = (valor) => (valor && valor.length >= 3) || 'El nombre debe tener al menos 3 caracteres.'
const correoValido = (valor) => /.+@.+\..+/.test(valor || '') || 'El correo no es válido.'
const segura = (valor) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(valor || '') || 'Use al menos 8 caracteres, con letras y números.'
const coincide = (valor) => valor === form.password || 'La confirmación no coincide.'

async function cargar() {
  cargando.value = true
  try {
    const { data } = await listar()
    usuarios.value = data.data
    disponibles.value = data.disponibles || []
    if (personaElegida.value && !disponibles.value.some((item) => item.email === personaElegida.value.email)) {
      personaElegida.value = null
    }
  } catch (error) {
    tipo.value = 'error'
    mensaje.value = mensajeError(error)
  } finally {
    cargando.value = false
  }
}

function usarPersona() {
  if (!personaElegida.value) return
  form.name = personaElegida.value.name
  form.email = personaElegida.value.email
  mensaje.value = ''
}

async function guardar() {
  mensaje.value = ''
  const { valid } = await formulario.value.validate()
  if (!valid) return
  guardando.value = true
  try {
    const { data } = await crear({ ...form })
    tipo.value = 'success'
    mensaje.value = data.message
    form.name = ''
    form.email = ''
    form.password = ''
    form.password_confirmation = ''
    formulario.value.resetValidation()
    await cargar()
  } catch (error) {
    tipo.value = 'error'
    mensaje.value = mensajeError(error)
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>
