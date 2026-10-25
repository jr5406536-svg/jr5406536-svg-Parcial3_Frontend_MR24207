import api from './api'

export function pdf(params) {
  return api.get('/reportes/pdf', { params, responseType: 'blob' })
}

export function csv(params) {
  return api.get('/reportes/csv', { params, responseType: 'blob' })
}

export function grafico(params) {
  return api.get('/reportes/grafico', { params })
}

export const MESES = [
  { mes: 1, nombre: 'Enero' },
  { mes: 2, nombre: 'Febrero' },
  { mes: 3, nombre: 'Marzo' },
  { mes: 4, nombre: 'Abril' },
  { mes: 5, nombre: 'Mayo' },
  { mes: 6, nombre: 'Junio' },
  { mes: 7, nombre: 'Julio' },
  { mes: 8, nombre: 'Agosto' },
  { mes: 9, nombre: 'Septiembre' },
  { mes: 10, nombre: 'Octubre' },
  { mes: 11, nombre: 'Noviembre' },
  { mes: 12, nombre: 'Diciembre' },
]
