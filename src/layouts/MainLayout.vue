<template>
  <v-app>
    <v-navigation-drawer
      permanent
      :rail="!expandido"
      rail-width="76"
      width="260"
      class="barra-lateral"
    >
      <div class="marca-lateral">
        <svg width="18" height="28" viewBox="0 0 18 28" aria-hidden="true">
          <path d="M2 0h14v18l-7 8-7-8V0z" fill="#2D52A8" />
        </svg>
      </div>

      <v-list nav density="comfortable" class="px-2">
        <v-list-item
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :exact="item.to === '/' || item.to === '/constancias'"
          rounded="lg"
          class="menu-item"
        />
      </v-list>

      <template #append>
        <v-list nav density="comfortable" class="px-2 pb-3">
          <v-list-item
            prepend-icon="mdi-logout"
            title="Salir"
            aria-label="Salir"
            rounded="lg"
            class="menu-item"
            @click="salir"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <section class="lienzo">
        <header class="barra-inicio">
          <v-btn icon variant="text" aria-label="Menú" @click="expandido = !expandido">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          <span class="marca">{{ titulo }}</span>
          <v-spacer />
          <v-menu>
            <template #activator="{ props }">
              <v-btn icon variant="text" v-bind="props" aria-label="Cuenta">
                <v-icon color="primary">mdi-account-circle-outline</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item :title="sesion.usuario?.name" :subtitle="sesion.usuario?.rol" />
              <v-list-item title="Salir" prepend-icon="mdi-logout" @click="salir" />
            </v-list>
          </v-menu>
        </header>

        <div class="bienvenida">
          <span>BIENVENIDO</span>
          <strong>{{ sesion.usuario?.name }}</strong>
        </div>

        <div class="contenido">
          <router-view />
        </div>
      </section>
    </v-main>

    <CambioPasswordDialog :abierto="debeCambiar" />
  </v-app>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CambioPasswordDialog from '../components/CambioPasswordDialog.vue'
import { debeCambiarPassword, esAdministrador, esUsuario, logout, sesion } from '../services/auth'

const route = useRoute()
const router = useRouter()
const expandido = ref(false)
const debeCambiar = computed(() => debeCambiarPassword())

const titulo = computed(() => route.meta.titulo || 'Inicio')

const menu = computed(() => {
  if (esAdministrador()) {
    return [
      { title: 'Inicio', to: '/', icon: 'mdi-home-outline' },
      { title: 'Usuarios', to: '/usuarios', icon: 'mdi-account-plus-outline' },
      { title: 'Registrar constancia', to: '/constancias/registrar', icon: 'mdi-file-document-edit-outline' },
      { title: 'Constancias', to: '/constancias', icon: 'mdi-file-document-multiple-outline' },
      { title: 'Informe PDF', to: '/reportes/pdf', icon: 'mdi-printer-outline' },
      { title: 'Informe CSV', to: '/reportes/csv', icon: 'mdi-file-excel-outline' },
      { title: 'Gráfico por mes', to: '/reportes/grafico', icon: 'mdi-chart-bar' },
    ]
  }

  if (!esUsuario()) {
    return [{ title: 'Inicio', to: '/', icon: 'mdi-home-outline' }]
  }

  return [
    { title: 'Inicio', to: '/', icon: 'mdi-home-outline' },
    { title: 'Solicitar constancia', to: '/mis-constancias/solicitar', icon: 'mdi-file-document-edit-outline' },
    { title: 'Mis constancias', to: '/mis-constancias', icon: 'mdi-file-document-outline' },
  ]
})

async function salir() {
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.barra-lateral {
  background: #313945 !important;
  border-right: 0 !important;
}

.barra-lateral :deep(.v-navigation-drawer__content),
.barra-lateral :deep(.v-navigation-drawer__prepend),
.barra-lateral :deep(.v-navigation-drawer__append) {
  background: #313945;
}

.marca-lateral {
  display: flex;
  justify-content: center;
  padding: 10px 0 4px;
}

.menu-item :deep(.v-list-item__prepend > .v-icon) {
  color: #fff;
  opacity: 1;
}

.menu-item {
  color: #fff;
}

.menu-item.v-list-item--active {
  background: rgba(255, 255, 255, 0.12);
}
</style>
