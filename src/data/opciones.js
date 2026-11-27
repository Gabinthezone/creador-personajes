// src/data/opciones.js
export const razas = [
  {
    id: 'humano',
    nombre: 'Humano',
    descripcion: 'Versátiles y ambiciosos. Se adaptan a cualquier situación.',
    imagen: '/img/razas/humano.png',
    bonus: { fuerza: 1, destreza: 1, inteligencia: 1 },
    rasgo: 'Versatilidad'
  },
  {
    id: 'elfo',
    nombre: 'Elfo',
    descripcion: 'Gráciles y longevos. Conectados con la magia natural.',
    imagen: '/img/razas/elfo.png',
    bonus: { destreza: 2, inteligencia: 1 },
    rasgo: 'Visión nocturna'
  },
  {
    id: 'enano',
    nombre: 'Enano',
    descripcion: 'Robustos y tercos. Maestros de la forja y la piedra.',
    imagen: '/img/razas/enano.png',
    bonus: { constitucion: 2, fuerza: 1 },
    rasgo: 'Resistencia mágica'
  },
  {
    id: 'orco',
    nombre: 'Orco',
    descripcion: 'Salvajes y honorables. La fuerza bruta es su idioma.',
    imagen: '/img/razas/orco.png',
    bonus: { fuerza: 3, constitucion: 1 },
    rasgo: 'Furia salvaje'
  }
]

export const clases = [
  {
    id: 'guerrero',
    nombre: 'Guerrero',
    descripcion: 'Combatiente cuerpo a cuerpo, resistente y letal.',
    imagen: '/img/clases/guerrero.png',
    dadoGolpe: 10,
    statPrincipal: 'fuerza',
    habilidadesBase: ['Ataque poderoso', 'Grito de guerra']
  },
  {
    id: 'mago',
    nombre: 'Mago',
    descripcion: 'Manipula la energía arcana para destruir o controlar.',
    imagen: '/img/clases/mago.png',
    dadoGolpe: 6,
    statPrincipal: 'inteligencia',
    habilidadesBase: ['Bola de fuego', 'Escudo arcano']
  },
  {
    id: 'picaro',
    nombre: 'Pícaro',
    descripcion: 'Sigiloso y astuto. Golpea donde más duele.',
    imagen: '/img/clases/picaro.png',
    dadoGolpe: 8,
    statPrincipal: 'destreza',
    habilidadesBase: ['Ataque furtivo', 'Esquivar']
  },
  {
    id: 'clerigo',
    nombre: 'Clérigo',
    descripcion: 'Canaliza el poder divino para sanar o castigar.',
    imagen: '/img/clases/clerigo.png',
    dadoGolpe: 8,
    statPrincipal: 'sabiduria',
    habilidadesBase: ['Curación', 'Luz divina']
  }
]

// Habilidades desbloqueadas según clase (para el arreglo dinámico)
export const habilidadesPorClase = {
  guerrero: ['Embate', 'Postura defensiva', 'Segundo aliento'],
  mago: ['Misil mágico', 'Teletransporte corto', 'Detectar magia'],
  picaro: ['Golpe bajo', 'Camuflaje', 'Abrir cerraduras'],
  clerigo: ['Bendición', 'Purificar', 'Escudo sagrado']
}