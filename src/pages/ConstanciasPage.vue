<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
      <div>
        <h1 class="titulo-6 mb-1">Constancias</h1>
        <p class="subtitulo-2 mb-0">
          Si eliges Inactiva y el correo es real, le llega el aviso de que su constancia está lista.
        </p>
      </div>
      <v-btn color="secondary" to="/constancias/registrar">Registrar nuevo</v-btn>
    </div>

    <v-row density="compact" class="mb-2">
      <v-col cols="12" md="3">
        <v-text-field v-model="borrador.nombre" label="Nombre" hide-details bg-color="white" />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field v-model="borrador.tipo" label="Tipo de constancia" hide-details bg-color="white" />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="borrador.estado"
          :items="opcionesFiltro"
          item-title="title"
          item-value="value"
          label="Estado"
          hide-details
          bg-color="white"
        />
      </v-col>
      <v-col cols="12" md="3" class="d-flex flex-wrap align-center justify-end ga-2">
        <v-btn color="secondary" @click="filtrar">FILTRAR</v-btn>
        <v-btn variant="outlined" color="secondary" @click="limpiar">LIMPIAR</v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />
    <v-alert v-if="aviso" type="success" variant="tonal" class="mb-4" :text="aviso" />

    <div class="tabla-scroll">
    <v-table class="tabla-estandar">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Usuario</th>
          <th>Correo</th>
          <th>Tipo</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="cargando">
          <td colspan="7" class="text-center py-6">Cargando...</td>
        </tr>
          <tr v-else-if="!filas.length">
            <td colspan="7" class="text-center py-6">No hay constancias en esta lista.</td>
          </tr>
        <tr v-else v-for="fila in filas" :key="fila.id_constancias">
          <td>{{ fila.nombre_empleado }}</td>
          <td>{{ fila.usuario || '—' }}</td>
          <td>{{ fila.correo }}</td>
          <td>{{ fila.tipo_de_constancia }}</td>
          <td>{{ fila.fecha_de_solicitud }}</td>
          <td>
            <v-select
              :model-value="estadoVisible(fila)"
              :items="opcionesEstado"
              item-title="title"
              item-value="value"
              density="compact"
              hide-details
              variant="outlined"
              class="estado-opcion"
              :disabled="cambiandoId === fila.id_constancias"
              :loading="cambiandoId === fila.id_constancias"
              aria-label="Estado de la constancia"
              @update:model-value="(valor) => cambiarEstado(fila, valor)"
            />
          </td>
          <td class="text-center">
            <v-btn
              :to="`/constancias/${fila.id_constancias}`"
              icon
              size="small"
              variant="text"
              color="secondary"
              aria-label="Ver"
            >
              <v-icon>mdi-eye-outline</v-icon>
            </v-btn>
            <v-btn
              :to="`/constancias/${fila.id_constancias}?editar=1`"
              icon
              size="small"
              variant="text"
              color="secondary"
              aria-label="Editar"
            >
              <v-icon>mdi-pencil-outline</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              color="secondary"
              aria-label="Enviar correo"
              :loading="cambiandoId === fila.id_constancias"
              @click="enviarAlUsuario(fila)"
            >
              <v-icon>mdi-email-fast</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              color="error"
              aria-label="Eliminar"
              @click="pedirBorrado(fila)"
            >
              <v-icon>mdi-delete-outline</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
    </div>

    <div class="d-flex align-center justify-end ga-4 py-3 text-body-2">
      <span>Filas por página: 5</span>
      <span>{{ rango }}</span>
      <v-pagination
        v-model="pagina"
        :length="ultima"
        :disabled="cargando"
        density="compact"
        total-visible="5"
        @update:model-value="cargar"
      />
    </div>

    <v-dialog v-model="confirmar" max-width="420">
      <v-card class="pa-2">
        <v-card-title class="titulo-6">Eliminar constancia</v-card-title>
        <v-card-text>
          Se eliminará la solicitud de {{ seleccionada?.nombre_empleado }}.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmar = false">Cerrar</v-btn>
          <v-btn color="error" :loading="eliminando" @click="borrar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { actualizar, eliminar, enviarCorreo, listar } from '../services/constancias'
import { mensajeError } from '../services/api'

const opcionesFiltro = [
  { title: 'Todas', value: '' },
  { title: 'Activas', value: 'activa' },
  { title: 'Inactivas', value: 'inactiva' },
]
const opcionesEstado = [
  { title: 'Activa', value: 'activa' },
  { title: 'Inactiva', value: 'inactiva' },
]

const filas = ref([])
const pagina = ref(1)
const ultima = ref(1)
const meta = ref({ from: 0, to: 0, total: 0 })
const cargando = ref(false)
const error = ref('')
const aviso = ref('')
const confirmar = ref(false)
const eliminando = ref(false)
const cambiandoId = ref(null)
const estadoElegido = ref({})
const seleccionada = ref(null)

const borrador = reactive({ nombre: '', tipo: '', estado: '' })
const filtros = reactive({ nombre: '', tipo: '', estado: '' })

const rango = computed(() => {
  if (!meta.value.total) return '0 de 0'
  return `${meta.value.from}-${meta.value.to} de ${meta.value.total}`
})

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await listar({
      estado: filtros.estado || undefined,
      nombre: filtros.nombre || undefined,
      tipo: filtros.tipo || undefined,
      page: pagina.value,
    })
    filas.value = data.data
    ultima.value = data.meta.last_page || 1
    meta.value = data.meta
  } catch (err) {
    error.value = mensajeError(err)
  } finally {
    cargando.value = false
  }
}

function filtrar() {
  filtros.nombre = borrador.nombre.trim()
  filtros.tipo = borrador.tipo.trim()
  filtros.estado = borrador.estado
  pagina.value = 1
  aviso.value = ''
  cargar()
}

function limpiar() {
  borrador.nombre = ''
  borrador.tipo = ''
  borrador.estado = ''
  filtros.nombre = ''
  filtros.tipo = ''
  filtros.estado = ''
  pagina.value = 1
  aviso.value = ''
  cargar()
}

function estadoVisible(fila) {
  return estadoElegido.value[fila.id_constancias] || (fila.estado_solicitud ? 'activa' : 'inactiva')
}

async function cambiarEstado(fila, valor) {
  if (valor !== 'activa' && valor !== 'inactiva') return
  if (cambiandoId.value) return
  if (valor === 'inactiva') {
    await enviarAlUsuario(fila)
    return
  }
  if (fila.estado_solicitud) return

  estadoElegido.value = { ...estadoElegido.value, [fila.id_constancias]: 'activa' }
  cambiandoId.value = fila.id_constancias
  error.value = ''
  aviso.value = ''
  try {
    await actualizar(fila.id_constancias, {
      nombre_empleado: fila.nombre_empleado,
      correo: fila.correo,
      movil: fila.movil,
      tipo_de_constancia: fila.tipo_de_constancia,
      descripcion: fila.descripcion,
      cantidad: fila.cantidad,
      estado_solicitud: true,
      user_id: fila.user_id,
    })
    aviso.value = 'La constancia quedó activa.'
    await cargar()
  } catch (err) {
    error.value = mensajeError(err)
  } finally {
    quitarEleccion(fila.id_constancias)
    cambiandoId.value = null
  }
}

async function enviarAlUsuario(fila) {
  if (cambiandoId.value) return

  estadoElegido.value = { ...estadoElegido.value, [fila.id_constancias]: 'inactiva' }
  cambiandoId.value = fila.id_constancias
  error.value = ''
  aviso.value = ''
  try {
    const { data } = await enviarCorreo(fila.id_constancias)
    aviso.value = data.message
    await cargar()
  } catch (err) {
    error.value = mensajeError(err)
  } finally {
    quitarEleccion(fila.id_constancias)
    cambiandoId.value = null
  }
}

function quitarEleccion(id) {
  const copia = { ...estadoElegido.value }
  delete copia[id]
  estadoElegido.value = copia
}

function pedirBorrado(fila) {
  seleccionada.value = fila
  confirmar.value = true
}

async function borrar() {
  if (!seleccionada.value) return
  eliminando.value = true
  error.value = ''
  try {
    await eliminar(seleccionada.value.id_constancias)
    aviso.value = 'Constancia eliminada.'
    confirmar.value = false
    await cargar()
  } catch (err) {
    error.value = mensajeError(err)
    confirmar.value = false
  } finally {
    eliminando.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
.estado-opcion {
  min-width: 140px;
}
</style>
