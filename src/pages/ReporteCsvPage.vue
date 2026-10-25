<template>
  <v-card class="pa-6" border>
    <h1 class="titulo-6 mb-1">Informe CSV</h1>
    <p class="subtitulo-2 mb-4">
      Descarga las constancias del mes. El archivo se abre en Excel con empleado, correo, tipo, fecha, hora y estado.
    </p>

    <v-alert v-if="mensaje" :type="tipo" variant="tonal" class="mb-4" :text="mensaje" />

    <v-row>
      <v-col cols="12" sm="4">
        <v-select v-model="mes" :items="MESES" item-title="nombre" item-value="mes" label="Mes" />
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field v-model.number="anio" label="Año" type="number" />
      </v-col>
      <v-col cols="12" sm="5" class="d-flex align-center">
        <v-btn color="secondary" prepend-icon="mdi-download" :loading="cargando" @click="descargar">
          Descargar CSV
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { csv, MESES } from '../services/reportes'
import { mensajeError } from '../services/api'

const hoy = new Date()
const mes = ref(hoy.getMonth() + 1)
const anio = ref(hoy.getFullYear())
const cargando = ref(false)
const mensaje = ref('')
const tipo = ref('success')

async function descargar() {
  mensaje.value = ''
  cargando.value = true
  try {
    const { data } = await csv({ mes: mes.value, anio: anio.value })
    const enlace = document.createElement('a')
    const url = URL.createObjectURL(data)
    enlace.href = url
    enlace.download = `constancias-${anio.value}-${String(mes.value).padStart(2, '0')}.csv`
    enlace.click()
    URL.revokeObjectURL(url)
    tipo.value = 'success'
    mensaje.value = 'El archivo CSV se descargó.'
  } catch (err) {
    tipo.value = 'error'
    mensaje.value = mensajeError(err)
  } finally {
    cargando.value = false
  }
}
</script>
