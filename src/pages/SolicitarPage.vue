<template>
  <v-card class="pa-6" border>
    <h1 class="titulo-6 mb-1">Solicitar constancia</h1>
    <p class="subtitulo-2 mb-4">
      Describe la constancia que necesitas. Llega activa al administrador. Cuando la pase a inactiva, te llega por correo.
    </p>

    <v-alert v-if="mensaje" :type="tipo" variant="tonal" class="mb-4" :text="mensaje" />

    <v-form ref="formulario" @submit.prevent="guardar">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field :model-value="sesion.usuario?.name" label="Nombre" readonly />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field :model-value="sesion.usuario?.email" label="Correo" readonly />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.movil" label="Móvil" :rules="reglas.movil" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.tipo_de_constancia" label="Tipo de constancia" :rules="reglas.tipo" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="form.cantidad" label="Cantidad" type="number" min="1" max="99" :rules="reglas.cantidad" />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="form.descripcion" label="Descripción" rows="3" :rules="reglas.descripcion" />
        </v-col>
      </v-row>
      <v-btn type="submit" color="secondary" :loading="cargando">Enviar solicitud</v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { sesion } from '../services/auth'
import { solicitar } from '../services/constancias'
import { mensajeError } from '../services/api'

const router = useRouter()
const formulario = ref(null)
const cargando = ref(false)
const mensaje = ref('')
const tipo = ref('success')

const form = reactive({
  movil: '',
  tipo_de_constancia: '',
  descripcion: '',
  cantidad: null,
})

const reglas = {
  movil: [
    (v) => !!v || 'El móvil es obligatorio.',
    (v) => /^[0-9+\-\s]{8,20}$/.test(v || '') || 'El móvil debe tener entre 8 y 20 dígitos.',
  ],
  tipo: [
    (v) => !!v || 'El tipo de constancia es obligatorio.',
    (v) => (v && v.length >= 3) || 'El tipo debe tener al menos 3 caracteres.',
  ],
  descripcion: [
    (v) => !!v || 'La descripción es obligatoria.',
    (v) => (v && v.length >= 10) || 'La descripción debe tener al menos 10 caracteres.',
  ],
  cantidad: [
    (v) => (v !== null && v !== '' && v !== undefined) || 'La cantidad es obligatoria.',
    (v) => (Number(v) >= 1 && Number(v) <= 99) || 'La cantidad debe estar entre 1 y 99.',
  ],
}

async function guardar() {
  mensaje.value = ''
  const { valid } = await formulario.value.validate()
  if (!valid) return

  cargando.value = true
  try {
    const { data } = await solicitar({ ...form })
    router.push(`/mis-constancias/${data.data.id_constancias}`)
  } catch (error) {
    tipo.value = 'error'
    mensaje.value = mensajeError(error)
    cargando.value = false
  }
}
</script>
