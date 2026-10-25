import { createRouter, createWebHistory } from 'vue-router'
import { debeCambiarPassword, usuarioActual } from '../services/auth'
import MainLayout from '../layouts/MainLayout.vue'
import LoginPage from '../pages/LoginPage.vue'
import CodigoPage from '../pages/CodigoPage.vue'
import InicioPage from '../pages/InicioPage.vue'
import RegistrarPage from '../pages/RegistrarPage.vue'
import UsuariosPage from '../pages/UsuariosPage.vue'
import ConstanciasPage from '../pages/ConstanciasPage.vue'
import DetallePage from '../pages/DetallePage.vue'
import MisConstanciasPage from '../pages/MisConstanciasPage.vue'
import SolicitarPage from '../pages/SolicitarPage.vue'
import MiDetallePage from '../pages/MiDetallePage.vue'
import ReportePdfPage from '../pages/ReportePdfPage.vue'
import ReporteCsvPage from '../pages/ReporteCsvPage.vue'
import GraficoPage from '../pages/GraficoPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage, meta: { publico: true } },
    { path: '/verificar', component: CodigoPage },
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', component: InicioPage, meta: { titulo: 'Inicio' } },
        {
          path: 'constancias/registrar',
          component: RegistrarPage,
          meta: { roles: ['administrador'], titulo: 'Registrar constancia' },
        },
        {
          path: 'constancias',
          component: ConstanciasPage,
          meta: { roles: ['administrador'], titulo: 'Constancias' },
        },
        { path: 'constancias/activas', redirect: '/constancias' },
        { path: 'constancias/inactivas', redirect: '/constancias' },
        {
          path: 'constancias/:id',
          component: DetallePage,
          meta: { roles: ['administrador'], titulo: 'Detalle de constancia' },
        },
        {
          path: 'usuarios',
          component: UsuariosPage,
          meta: { roles: ['administrador'], titulo: 'Usuarios' },
        },
        {
          path: 'mis-constancias',
          component: MisConstanciasPage,
          meta: { roles: ['usuario'], titulo: 'Mis constancias' },
        },
        {
          path: 'mis-constancias/solicitar',
          component: SolicitarPage,
          meta: { roles: ['usuario'], titulo: 'Solicitar constancia' },
        },
        {
          path: 'mis-constancias/:id',
          component: MiDetallePage,
          meta: { roles: ['usuario'], titulo: 'Mi constancia' },
        },
        {
          path: 'reportes/pdf',
          component: ReportePdfPage,
          meta: { roles: ['administrador'], titulo: 'Informe PDF' },
        },
        {
          path: 'reportes/csv',
          component: ReporteCsvPage,
          meta: { roles: ['administrador'], titulo: 'Informe CSV' },
        },
        {
          path: 'reportes/grafico',
          component: GraficoPage,
          meta: { roles: ['administrador'], titulo: 'Gráfico por mes' },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const paso = localStorage.getItem('paso') || 'inicio'
  const usuario = usuarioActual()

  if (to.path === '/login' && token) {
    return paso === 'codigo' ? '/verificar' : '/'
  }

  if (!to.meta.publico && !token) {
    return '/login'
  }

  if (!token) {
    return
  }

  if (paso === 'codigo' && to.path !== '/verificar') {
    return '/verificar'
  }

  if (to.path === '/verificar' && paso !== 'codigo') {
    return '/'
  }

  if (debeCambiarPassword() && to.path !== '/') {
    return '/'
  }

  const restringida = [...to.matched].reverse().find((ruta) => ruta.meta.roles)
  if (restringida && !restringida.meta.roles.includes(usuario?.rol)) {
    return '/'
  }
})

export default router
