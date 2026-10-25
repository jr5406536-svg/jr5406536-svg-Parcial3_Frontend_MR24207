import api from './api'

export function listar() {
  return api.get('/usuarios')
}

export function crear(payload) {
  return api.post('/usuarios', payload)
}
