import api from './api'

export function listar(params) {
  return api.get('/constancias', { params })
}

export function obtener(id) {
  return api.get(`/constancias/${id}`)
}

export function crear(payload) {
  return api.post('/constancias', payload)
}

export function actualizar(id, payload) {
  return api.put(`/constancias/${id}`, payload)
}

export function eliminar(id) {
  return api.delete(`/constancias/${id}`)
}

export function enviarCorreo(id) {
  return api.post(`/constancias/${id}/enviar-correo`)
}

export function obtenerQr(id) {
  return api.get(`/constancias/${id}/qr`, { responseType: 'blob' })
}

export function listarMias(params) {
  return api.get('/mis-constancias', { params })
}

export function solicitar(payload) {
  return api.post('/mis-constancias', payload)
}

export function obtenerMia(id) {
  return api.get(`/mis-constancias/${id}`)
}

export function obtenerQrMio(id) {
  return api.get(`/mis-constancias/${id}/qr`, { responseType: 'blob' })
}
