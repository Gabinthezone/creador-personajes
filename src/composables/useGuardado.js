
const STORAGE_KEY = 'creador-personajes'

export function useGuardado() {
  function guardar(personaje) {
    if (!personaje.nombre.trim()) {
      throw new Error('El personaje necesita un nombre para guardarse')
    }
    const guardados = listar()
    const id = crypto.randomUUID()
    const nuevo = {
      id,
      ...JSON.parse(JSON.stringify(personaje)), // deep clone
      fechaGuardado: new Date().toISOString()
    }
    guardados.push(nuevo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guardados))
    return nuevo
  }

  function listar() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  function cargar(id) {
    return listar().find(p => p.id === id) || null
  }

  function eliminar(id) {
    const filtrados = listar().filter(p => p.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados))
  }

  return { guardar, listar, cargar, eliminar }
}