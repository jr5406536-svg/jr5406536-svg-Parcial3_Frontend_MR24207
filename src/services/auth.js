import { reactive } from 'vue'
import api from './api'

export const sesion = reactive({
  usuario: leerUsuario(),
  paso: localStorage.getItem('paso') || '',
})

function leerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export function usuarioActual() {
  return sesion.usuario
}

export function esAdministrador() {
  return sesion.usuario?.rol === 'administrador'
}

export function esUsuario() {
  return sesion.usuario?.rol === 'usuario'
}

const clavePasswordLista = 'password_lista'

function idsConPasswordLista() {
  try {
    const lista = JSON.parse(localStorage.getItem(clavePasswordLista) || '[]')
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

function recordarPasswordLista(id) {
  if (!id || idsConPasswordLista().includes(id)) return
  localStorage.setItem(clavePasswordLista, JSON.stringify([...idsConPasswordLista(), id]))
}

function olvidarPasswordLista(id) {
  if (!id) return
  localStorage.setItem(
    clavePasswordLista,
    JSON.stringify(idsConPasswordLista().filter((item) => item !== id)),
  )
}

export function debeCambiarPassword() {
  const usuario = sesion.usuario
  if (!usuario?.id || sesion.paso !== 'cambiar-password') return false
  if (idsConPasswordLista().includes(usuario.id)) return false
  return usuario.password_temporal === true
}

export function guardarSesion(data) {
  const usuario = data.user ? { ...data.user } : null
  const paso = data.paso

  if (paso === 'cambiar-password' && usuario?.password_temporal === true) {
    olvidarPasswordLista(usuario.id)
  } else if (usuario && (usuario.password_temporal === false || paso === 'inicio')) {
    recordarPasswordLista(usuario.id)
    usuario.password_temporal = false
  }

  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(usuario))
  localStorage.setItem('paso', paso)
  sesion.usuario = usuario
  sesion.paso = paso
  if (data.enrolamiento) {
    sessionStorage.setItem('enrolamiento', JSON.stringify(data.enrolamiento))
  }
  return { ...data, user: usuario, paso }
}

export async function login(email, password) {
  const { data } = await api.post('/login', { email, password })
  return guardarSesion(data)
}

export async function verificarCodigo(codigo) {
  const { data } = await api.post('/verificar-codigo', { codigo })
  sessionStorage.removeItem('enrolamiento')
  return guardarSesion(data)
}

export async function obtenerEnrolamiento() {
  const guardado = sessionStorage.getItem('enrolamiento')
  if (guardado) {
    return JSON.parse(guardado)
  }
  const { data } = await api.get('/enrolamiento')
  if (data.enrolamiento) {
    sessionStorage.setItem('enrolamiento', JSON.stringify(data.enrolamiento))
  }
  return data.enrolamiento
}

export async function cambiarPassword(payload) {
  const { data } = await api.post('/cambiar-password', payload)
  return guardarSesion(data)
}

export async function logout() {
  try {
    await api.post('/logout')
  } catch {
    // Si el token ya venció, igual se cierra la sesión local.
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('paso')
  sessionStorage.removeItem('enrolamiento')
  sesion.usuario = null
  sesion.paso = ''
}
