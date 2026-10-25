<template>
  <div>
    <v-btn variant="text" color="secondary" prepend-icon="mdi-arrow-left" class="mb-3" @click="volver">
      Regresar
    </v-btn>

    <v-alert v-if="aviso" :type="tipoAviso" variant="tonal" class="mb-4" :text="aviso" />
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <v-row v-if="constancia">
      <v-col cols="12" md="8">
        <v-card class="pa-6" border>
          <div class="d-flex align-center mb-4">
            <div>
              <h1 class="titulo-6">Constancia #{{ constancia.id_constancias }}</h1>
              <p class="subtitulo-2 mb-0">{{ constancia.nombre_empleado }}</p>
            </div>
            <v-spacer />
            <span :class="constancia.estado_solicitud ? 'estado-activa' : 'estado-inactiva'">
              {{ constancia.estado }}
            </span>
          </div>

          <v-form v-if="editando" ref="formulario" @submit.prevent="guardar">
            <v-select
              v-model="form.user_id"
              :items="usuarios"
              item-title="name"
              item-value="id"
              label="Usuario"
              clearable
              no-data-text="No hay usuarios creados."
            />
            <v-text-field v-model="form.nombre_empleado" label="Nombre del empleado" :rules="reglas.nombre" />
            <v-text-field v-model="form.correo" label="Correo" :rules="reglas.correo" />
            <v-text-field v-model="form.movil" label="Móvil" :rules="reglas.movil" />
            <v-text-field v-model="form.tipo_de_constancia" label="Tipo de constancia" :rules="reglas.tipo" />
            <v-text-field v-model.number="form.cantidad" label="Cantidad" type="number" :rules="reglas.cantidad" />
            <v-textarea v-model="form.descripcion" label="Descripción" rows="3" :rules="reglas.descripcion" />
            <v-switch
              v-model="form.estado_solicitud"
              color="secondary"
              label="Activa"
              hint="Apagado: se envía al correo de quien la pidió."
              persistent-hint
              inset
            />
            <div class="text-body-2 text-medium-emphasis mb-4">
              Solicitada el {{ constancia.fecha_de_solicitud }} a las {{ constancia.hora_de_solicitud }}
            </div>
            <v-btn type="submit" color="secondary" class="mr-2" :loading="guardando">Guardar</v-btn>
            <v-btn variant="outlined" color="secondary" @click="editando = false">Cerrar</v-btn>
          </v-form>

          <template v-else>
            <v-list lines="two">
              <v-list-item title="Usuario" :subtitle="constancia.usuario || 'Sin usuario asignado'" />
            <v-list-item title="Correo" :subtitle="constancia.correo" />
              <v-list-item title="Móvil" :subtitle="constancia.movil" />
              <v-list-item title="Tipo" :subtitle="constancia.tipo_de_constancia" />
              <v-list-item title="Cantidad" :subtitle="String(constancia.cantidad)" />
              <v-list-item title="Fecha y hora" :subtitle="`${constancia.fecha_de_solicitud} ${constancia.hora_de_solicitud}`" />
              <v-list-item title="Descripción" :subtitle="constancia.descripcion" />
            </v-list>
            <div class="d-flex flex-wrap ga-2 mt-4">
              <v-btn color="secondary" prepend-icon="mdi-pencil" @click="empezarEdicion">Actualizar</v-btn>
              <v-btn color="secondary" variant="outlined" prepend-icon="mdi-email-fast" :loading="enviando" @click="notificar">
                Enviar correo
              </v-btn>
              <v-btn color="error" prepend-icon="mdi-delete" @click="confirmar = true">
                Eliminar
              </v-btn>
            </div>
            <p class="subtitulo-2 mt-3 mb-0">
              Al dejarla inactiva, el correo sale a quien la pidió.
            </p>
          </template>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 text-center" border>
          <div class="text-subtitle-1 mb-3">Código QR</div>
          <v-img v-if="qrUrl" :src="qrUrl" alt="QR de la constancia" width="220" class="mx-auto" />
          <div v-else class="text-body-2 text-medium-emphasis">Cargando QR...</div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="confirmar" max-width="420">
      <v-card class="pa-4">
        <v-card-title>Eliminar constancia</v-card-title>
        <v-card-text>Esta solicitud se borrará de la base de datos.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmar = false">Cancelar</v-btn>
          <v-btn color="error" :loading="eliminando" @click="borrar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { actualizar, eliminar, enviarCorreo, obtener, obtenerQr } from '../services/constancias'
import { listar as listarUsuarios } from '../services/usuarios'
import { mensajeError } from '../services/api'

const route = useRoute()
const router = useRouter()
const constancia = ref(null)
const error = ref('')
const aviso = ref('')
const tipoAviso = ref('success')
const editando = ref(false)
const formulario = ref(null)
const guardando = ref(false)
const enviando = ref(false)
const eliminando = ref(false)
const confirmar = ref(false)
const qrUrl = ref('')
const usuarios = ref([])

const form = reactive({
  nombre_empleado: '',
  correo: '',
  movil: '',
  tipo_de_constancia: '',
  descripcion: '',
  cantidad: 1,
  estado_solicitud: true,
  user_id: null,
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

function llenarFormulario(dato) {
  form.nombre_empleado = dato.nombre_empleado
  form.correo = dato.correo
  form.movil = dato.movil
  form.tipo_de_constancia = dato.tipo_de_constancia
  form.descripcion = dato.descripcion
  form.cantidad = dato.cantidad
  form.estado_solicitud = dato.estado_solicitud
  form.user_id = dato.user_id
}

async function cargarQr(id) {
  if (qrUrl.value) URL.revokeObjectURL(qrUrl.value)
  const { data } = await obtenerQr(id)
  qrUrl.value = URL.createObjectURL(data)
}

async function cargar() {
  error.value = ''
  try {
    const { data } = await obtener(route.params.id)
    constancia.value = data.data
    llenarFormulario(data.data)
    editando.value = route.query.editar === '1'
    const lista = await listarUsuarios()
    usuarios.value = lista.data.data
    await cargarQr(route.params.id)
  } catch (err) {
    error.value = mensajeError(err)
  }
}

function volver() {
  router.push('/constancias')
}

function empezarEdicion() {
  llenarFormulario(constancia.value)
  editando.value = true
}

async function guardar() {
  const { valid } = await formulario.value.validate()
  if (!valid) return
  guardando.value = true
  aviso.value = ''
  try {
    const { data } = await actualizar(route.params.id, { ...form })
    constancia.value = data.data
    editando.value = false
    tipoAviso.value = 'success'
    aviso.value = data.message || 'Constancia actualizada.'
    await cargarQr(route.params.id)
  } catch (err) {
    tipoAviso.value = 'error'
    aviso.value = mensajeError(err)
  } finally {
    guardando.value = false
  }
}

async function notificar() {
  enviando.value = true
  aviso.value = ''
  try {
    const { data } = await enviarCorreo(route.params.id)
    tipoAviso.value = 'success'
    aviso.value = data.message
    if (constancia.value) {
      constancia.value.estado_solicitud = false
      constancia.value.estado = 'Inactiva'
    }
  } catch (err) {
    tipoAviso.value = 'error'
    aviso.value = mensajeError(err)
  } finally {
    enviando.value = false
  }
}

async function borrar() {
  eliminando.value = true
  try {
    await eliminar(route.params.id)
    router.push('/constancias')
  } catch (err) {
    error.value = mensajeError(err)
    confirmar.value = false
  } finally {
    eliminando.value = false
  }
}

watch(() => route.params.id, cargar, { immediate: true })

onBeforeUnmount(() => {
  if (qrUrl.value) URL.revokeObjectURL(qrUrl.value)
})
</script>
