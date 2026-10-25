<template>
  <div>
    <v-btn variant="text" color="secondary" prepend-icon="mdi-arrow-left" class="mb-3" to="/mis-constancias">
      Regresar
    </v-btn>

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
              {{ constancia.estado_solicitud ? 'Activa' : 'Inactiva' }}
            </span>
          </div>
          <v-list lines="two">
            <v-list-item title="Correo" :subtitle="constancia.correo" />
            <v-list-item title="Móvil" :subtitle="constancia.movil" />
            <v-list-item title="Tipo" :subtitle="constancia.tipo_de_constancia" />
            <v-list-item title="Cantidad" :subtitle="String(constancia.cantidad)" />
            <v-list-item title="Fecha y hora" :subtitle="`${constancia.fecha_de_solicitud} ${constancia.hora_de_solicitud}`" />
            <v-list-item title="Descripción" :subtitle="constancia.descripcion" />
          </v-list>
          <p v-if="constancia.estado_solicitud" class="subtitulo-2 mt-4 mb-0">
            Sigue activa. Cuando el administrador la pase a inactiva, la constancia llega a tu correo.
          </p>
          <p v-else class="subtitulo-2 mt-4 mb-0">
            Está inactiva. La constancia se envió al correo con el que pediste la solicitud.
          </p>
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
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { obtenerMia, obtenerQrMio } from '../services/constancias'
import { mensajeError } from '../services/api'

const route = useRoute()
const constancia = ref(null)
const error = ref('')
const qrUrl = ref('')

async function cargar() {
  error.value = ''
  constancia.value = null
  if (qrUrl.value) URL.revokeObjectURL(qrUrl.value)
  qrUrl.value = ''
  try {
    const { data } = await obtenerMia(route.params.id)
    constancia.value = data.data
    const qr = await obtenerQrMio(route.params.id)
    qrUrl.value = URL.createObjectURL(qr.data)
  } catch (err) {
    error.value = mensajeError(err)
  }
}

watch(() => route.params.id, cargar, { immediate: true })

onBeforeUnmount(() => {
  if (qrUrl.value) URL.revokeObjectURL(qrUrl.value)
})
</script>
