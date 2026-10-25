<template>
  <v-card class="pa-6" border>
    <h1 class="titulo-6 mb-1">Registrar constancia</h1>
    <p class="subtitulo-2 mb-4">
    Elige un usuario que hayas creado en Usuarios. Puede ser alguien que ya tenía constancia o una persona nueva.
    </p>

    <v-alert v-if="mensaje" :type="tipo" variant="tonal" class="mb-4" :text="mensaje" />

    <v-form ref="formulario" @submit.prevent="guardar">
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="form.user_id"
            :items="usuarios"
            item-title="name"
            item-value="id"
            label="Usuario"
            :rules="[(v) => !!v || 'Elige el usuario dueño de la constancia.']"
            :loading="cargandoUsuarios"
            no-data-text="Crea un usuario antes de registrar."
            @update:model-value="elegirUsuario"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.nombre_empleado" label="Nombre del empleado" :rules="reglas.nombre" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.correo" label="Correo" type="email" :rules="reglas.correo" />
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
        <v-col cols="12">
          <v-switch
            v-model="form.estado_solicitud"
            color="secondary"
            label="Activa"
            hint="Apagado: el usuario la ve pendiente."
            persistent-hint
            inset
          />
        </v-col>
      </v-row>
      <v-btn type="submit" color="secondary" :loading="cargando">Registrar</v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { crear } from '../services/constancias'
import { listar as listarUsuarios } from '../services/usuarios'
import { mensajeError } from '../services/api'

const formulario = ref(null)
const cargando = ref(false)
const cargandoUsuarios = ref(false)
const usuarios = ref([])
const mensaje = ref('')
const tipo = ref('success')

const form = reactive({
  user_id: null,
  nombre_empleado: '',
  correo: '',
  movil: '',
  tipo_de_constancia: '',
  descripcion: '',
  cantidad: null,
  estado_solicitud: false,
})

const reglas = {
  nombre: [
    (v) => !!v || 'El nombre del empleado es obligatorio.',
    (v) => (v && v.length >= 3) || 'El nombre debe tener al menos 3 caracteres.',
  ],
  correo: [
    (v) => !!v || 'El correo es obligatorio.',
    (v) => /.+@.+\..+/.test(v || '') || 'El correo no es válido.',
  ],
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

function elegirUsuario(id) {
  const persona = usuarios.value.find((item) => item.id === id)
  if (!persona) return
  form.nombre_empleado = persona.name
  form.correo = persona.email
}

function limpiar() {
  form.user_id = null
  form.nombre_empleado = ''
  form.correo = ''
  form.movil = ''
  form.tipo_de_constancia = ''
  form.descripcion = ''
  form.cantidad = null
  form.estado_solicitud = false
  formulario.value?.resetValidation()
}

async function guardar() {
  mensaje.value = ''
  const { valid } = await formulario.value.validate()
  if (!valid) return

  cargando.value = true
  try {
    const { data } = await crear({ ...form })
    tipo.value = 'success'
    mensaje.value = `Constancia #${data.data.id_constancias} registrada.`
    limpiar()
  } catch (error) {
    tipo.value = 'error'
    mensaje.value = mensajeError(error)
  } finally {
    cargando.value = false
  }
}
onMounted(async () => {
  cargandoUsuarios.value = true
  try {
    const { data } = await listarUsuarios()
    usuarios.value = data.data
  } catch (error) {
    tipo.value = 'error'
    mensaje.value = mensajeError(error)
  } finally {
    cargandoUsuarios.value = false
  }
})
</script>
