<template>
  <div>
    <h1 class="titulo-6 mb-3">Constancias - Impresión</h1>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-3" :text="error" />

    <div class="visor-pdf">
      <div v-show="url" ref="hojas" class="hojas"></div>
      <iframe v-if="url" ref="marco" class="marco-impresion" :src="url" title="Visor PDF de constancias"></iframe>
      <p v-if="!url" class="texto-espera">{{ cargando ? 'Generando el PDF...' : 'Elija el mes para ver el documento.' }}</p>
    </div>

    <div class="barra-impresion">
      <v-select
        v-model="mes"
        :items="MESES"
        item-title="nombre"
        item-value="mes"
        label="Mes"
        hide-details
        bg-color="white"
        style="max-width: 220px"
        @update:model-value="generar"
      />
      <v-text-field
        v-model.number="anio"
        label="Año"
        type="number"
        hide-details
        bg-color="white"
        style="max-width: 140px"
        @change="generar"
      />
      <v-spacer />
      <v-btn color="error" :loading="cargando" :disabled="!url" @click="imprimir">Imprimir</v-btn>
      <v-btn variant="outlined" color="secondary" class="ml-2" @click="regresar">Regresar</v-btn>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as pdfjs from 'pdfjs-dist'
import workerPdf from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { MESES, pdf } from '../services/reportes'
import { mensajeError } from '../services/api'

pdfjs.GlobalWorkerOptions.workerSrc = workerPdf

const router = useRouter()
const hoy = new Date()
const mes = ref(hoy.getMonth() + 1)
const anio = ref(hoy.getFullYear())
const url = ref('')
const error = ref('')
const cargando = ref(false)
const marco = ref(null)
const hojas = ref(null)

async function pintar(buffer) {
  const documento = await pdfjs.getDocument({ data: buffer }).promise
  await nextTick()
  hojas.value.innerHTML = ''
  for (let numero = 1; numero <= documento.numPages; numero += 1) {
    const pagina = await documento.getPage(numero)
    const vista = pagina.getViewport({ scale: 1.25 })
    const lienzo = document.createElement('canvas')
    lienzo.width = vista.width
    lienzo.height = vista.height
    lienzo.className = 'hoja'
    hojas.value.appendChild(lienzo)
    await pagina.render({ canvasContext: lienzo.getContext('2d'), viewport: vista }).promise
  }
}

async function generar() {
  error.value = ''
  cargando.value = true
  try {
    const { data } = await pdf({ mes: mes.value, anio: anio.value })
    const archivo = new Blob([data], { type: 'application/pdf' })
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = URL.createObjectURL(archivo)
    await pintar(await archivo.arrayBuffer())
  } catch (err) {
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = ''
    if (hojas.value) hojas.value.innerHTML = ''
    error.value = await leerError(err)
  } finally {
    cargando.value = false
  }
}

function imprimir() {
  marco.value?.contentWindow?.focus()
  marco.value?.contentWindow?.print()
}

function regresar() {
  router.push('/')
}

async function leerError(err) {
  const data = err.response?.data
  if (data instanceof Blob) {
    try {
      const json = JSON.parse(await data.text())
      return json.message || 'No se pudo generar el PDF.'
    } catch {
      return 'No se pudo generar el PDF.'
    }
  }
  return mensajeError(err)
}

onMounted(generar)

onBeforeUnmount(() => {
  if (url.value) URL.revokeObjectURL(url.value)
})
</script>

<style scoped>
.texto-espera {
  color: #d5deea;
  align-self: center;
}

.hojas {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.hojas :deep(.hoja) {
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  max-width: 100%;
  height: auto;
}

.marco-impresion {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.barra-impresion {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}
</style>
