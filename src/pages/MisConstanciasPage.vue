<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
      <div>
        <h1 class="titulo-6 mb-1">Mis constancias</h1>
        <p class="subtitulo-2 mb-0">Activa: el administrador todavía la tiene en trámite. Inactiva: ya te la envió por correo.</p>
      </div>
      <v-btn color="secondary" to="/mis-constancias/solicitar">Solicitar constancia</v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <div class="tabla-scroll">
      <v-table class="tabla-estandar">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th class="text-center">Ver</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cargando">
            <td colspan="5" class="text-center py-6">Cargando...</td>
          </tr>
          <tr v-else-if="!filas.length">
            <td colspan="5" class="text-center py-6">Todavía no tienes constancias.</td>
          </tr>
          <tr v-else v-for="fila in filas" :key="fila.id_constancias">
            <td>{{ fila.nombre_empleado }}</td>
            <td>{{ fila.tipo_de_constancia }}</td>
            <td>{{ fila.fecha_de_solicitud }}</td>
            <td>
              <span :class="fila.estado_solicitud ? 'estado-activa' : 'estado-inactiva'">
                {{ fila.estado_solicitud ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td class="text-center">
              <v-btn
                :to="`/mis-constancias/${fila.id_constancias}`"
                icon
                size="small"
                variant="text"
                color="secondary"
                aria-label="Ver"
              >
                <v-icon>mdi-eye-outline</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <div class="d-flex align-center justify-end ga-4 py-3 text-body-2">
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { listarMias } from '../services/constancias'
import { mensajeError } from '../services/api'

const filas = ref([])
const pagina = ref(1)
const ultima = ref(1)
const meta = ref({ from: 0, to: 0, total: 0 })
const cargando = ref(false)
const error = ref('')

const rango = computed(() => {
  if (!meta.value.total) return '0 de 0'
  return `${meta.value.from}-${meta.value.to} de ${meta.value.total}`
})

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await listarMias({ page: pagina.value })
    filas.value = data.data
    ultima.value = data.meta.last_page || 1
    meta.value = data.meta
  } catch (err) {
    error.value = mensajeError(err)
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>
