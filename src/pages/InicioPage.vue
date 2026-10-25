<template>
  <div>
    <h1 class="titulo-6 mb-1">{{ titulo }}</h1>
    <p class="subtitulo-2 mb-4">{{ descripcion }}</p>

    <v-row>
      <v-col v-for="accion in acciones" :key="accion.to" cols="12" sm="6" md="4">
        <v-card class="pa-4 h-100" border :to="accion.to">
          <v-icon color="secondary" size="28" class="mb-2">{{ accion.icon }}</v-icon>
          <div class="titulo-6">{{ accion.title }}</div>
          <p class="subtitulo-2 mb-0">{{ accion.texto }}</p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { esAdministrador, esUsuario } from '../services/auth'

const titulo = computed(() => (esAdministrador() ? 'Administración' : 'Mis constancias'))

const descripcion = computed(() => {
  if (esAdministrador()) {
    return 'Crea las cuentas. En Constancias ves las activas y las inactivas, cambias el estado y envías el correo.'
  }
  if (esUsuario()) {
    return 'Solicita la constancia que necesitas. El administrador le da seguimiento y te la envía a tu correo.'
  }
  return 'Tu cuenta no tiene un rol con acciones asignadas.'
})

const acciones = computed(() => {
  if (esAdministrador()) {
    return [
      {
        title: 'Usuarios',
        texto: 'Crea la cuenta con la que una persona entra y ve solo sus constancias.',
        to: '/usuarios',
        icon: 'mdi-account-plus-outline',
      },
      {
        title: 'Registrar constancia',
        texto: 'Asígnale una solicitud a un usuario. Puedes dejarla activa o pendiente.',
        to: '/constancias/registrar',
        icon: 'mdi-file-document-edit-outline',
      },
      {
        title: 'Constancias',
        texto: 'Activas e inactivas en la misma tabla. Elige si sigue activa o pasa a inactiva.',
        to: '/constancias',
        icon: 'mdi-file-document-multiple-outline',
      },
      {
        title: 'Informe PDF',
        texto: 'Abre el documento del mes para revisarlo e imprimirlo.',
        to: '/reportes/pdf',
        icon: 'mdi-printer-outline',
      },
      {
        title: 'Informe CSV',
        texto: 'Descarga el archivo del mes para abrirlo en Excel.',
        to: '/reportes/csv',
        icon: 'mdi-file-excel-outline',
      },
      {
        title: 'Gráfico por mes',
        texto: 'Compara activas e inactivas del mes que elijas.',
        to: '/reportes/grafico',
        icon: 'mdi-chart-bar',
      },
    ]
  }

  if (!esUsuario()) return []

  return [
    {
      title: 'Solicitar constancia',
        texto: 'Pide la constancia que necesitas. Llega activa para que el administrador le dé seguimiento.',
      to: '/mis-constancias/solicitar',
      icon: 'mdi-file-document-edit-outline',
    },
    {
      title: 'Mis constancias',
        texto: 'Revisa si siguen activas o si el administrador ya las dejó inactivas y te las envió.',
      to: '/mis-constancias',
      icon: 'mdi-file-document-outline',
    },
  ]
})
</script>
