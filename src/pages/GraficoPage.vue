<template>
  <v-card class="pa-6" border>
    <h1 class="titulo-6 mb-1">Gráfico por mes</h1>
    <p class="subtitulo-2 mb-4">
      Constancias activas e inactivas del mes seleccionado.
    </p>

    <v-row>
      <v-col cols="12" sm="4">
        <v-select v-model="mes" :items="MESES" item-title="nombre" item-value="mes" label="Mes" />
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field v-model.number="anio" label="Año" type="number" />
      </v-col>
      <v-col cols="12" sm="5" class="d-flex align-center">
        <v-btn color="secondary" :loading="cargando" @click="consultar">Mostrar gráfico</v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <div v-if="resumen" style="max-width: 640px">
      <div class="text-subtitle-1 mb-2">{{ resumen.nombre_mes }} {{ resumen.anio }} · total {{ resumen.total }}</div>
      <Bar :data="datos" :options="opciones" />
    </div>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { grafico, MESES } from '../services/reportes'
import { mensajeError } from '../services/api'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const hoy = new Date()
const mes = ref(hoy.getMonth() + 1)
const anio = ref(hoy.getFullYear())
const resumen = ref(null)
const error = ref('')
const cargando = ref(false)

const datos = computed(() => ({
  labels: resumen.value?.labels || [],
  datasets: [
    {
      label: 'Constancias',
      data: resumen.value?.data || [],
      backgroundColor: ['#57CC99', '#EF5350'],
    },
  ],
}))

const opciones = {
  responsive: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
}

async function consultar() {
  error.value = ''
  cargando.value = true
  try {
    const { data } = await grafico({ mes: mes.value, anio: anio.value })
    resumen.value = data
  } catch (err) {
    resumen.value = null
    error.value = mensajeError(err)
  } finally {
    cargando.value = false
  }
}

consultar()
</script>
