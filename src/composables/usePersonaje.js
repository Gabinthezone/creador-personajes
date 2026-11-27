
import { reactive, computed } from 'vue'
import { razas, clases } from '@/data/opciones'

export function usePersonaje() {
  const personaje = reactive({
    nombre: '',
    razaId: 'humano',
    claseId: 'guerrero',
    atributosBase: { fuerza: 10, destreza: 10, constitucion: 10, inteligencia: 10, sabiduria: 10, carisma: 10 },
    habilidades: [],
    equipo: []
  })

  // Datos derivados
  const razaActual = computed(() => razas.find(r => r.id === personaje.razaId))
  const claseActual = computed(() => clases.find(c => c.id === personaje.claseId))

  // Atributos finales = base + bonus racial
  const atributosFinales = computed(() => {
    const finales = { ...personaje.atributosBase }
    const bonus = razaActual.value?.bonus || {}
    for (const stat in bonus) {
      finales[stat] = (finales[stat] || 0) + bonus[stat]
    }
    return finales
  })

  // Modificador D&D (floor((stat-10)/2))
  function modificador(stat) {
    return Math.floor((atributosFinales.value[stat] - 10) / 2)
  }

  // Puntos de vida = dadoGolpe + mod constitucion (mínimo 1)
  const puntosVida = computed(() => {
    const dado = claseActual.value?.dadoGolpe || 8
    return Math.max(1, dado + modificador('constitucion'))
  })

  // Poder total (para "score" del personaje)
  const poderTotal = computed(() => {
    const sumaAtributos = Object.values(atributosFinales.value).reduce((a, b) => a + b, 0)
    return sumaAtributos + puntosVida.value + personaje.habilidades.length * 2
  })

  // Funciones
  function agregarHabilidad(nombre = '') {
    personaje.habilidades.push({ id: crypto.randomUUID(), nombre })
  }
  function eliminarHabilidad(id) {
    personaje.habilidades = personaje.habilidades.filter(h => h.id !== id)
  }
  function cargarHabilidadesBase() {
    personaje.habilidades = (claseActual.value?.habilidadesBase || [])
      .map(nombre => ({ id: crypto.randomUUID(), nombre }))
  }
  function resetear() {
    Object.assign(personaje, {
      nombre: '',
      razaId: 'humano',
      claseId: 'guerrero',
      atributosBase: { fuerza: 10, destreza: 10, constitucion: 10, inteligencia: 10, sabiduria: 10, carisma: 10 },
      habilidades: [],
      equipo: []
    })
  }

  return {
    personaje, razas, clases, razaActual, claseActual,
    atributosFinales, modificador, puntosVida, poderTotal,
    agregarHabilidad, eliminarHabilidad, cargarHabilidadesBase, resetear
  }
}