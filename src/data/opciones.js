// src/data/opciones.js
export const razas = [
  {
    id: 'humano',
    nombre: 'Humano',
    descripcion: 'Versátiles y ambiciosos. Se adaptan a cualquier situación.',
    imagen: '/img/razas/humano.png',
    historia: 'Los humanos son la raza más común y diversa del mundo. Su capacidad de adaptación y su ambición los ha llevado a prosperar en casi todos los entornos, desde las ciudades más bulliciosas hasta los desiertos más áridos. A lo largo de la historia, los humanos han demostrado ser innovadores, valientes y resilientes, enfrentando desafíos que otras razas podrían considerar insuperables.',
    bonus: { fuerza: 1, destreza: 1, inteligencia: 1 },
    rasgo: 'Versatilidad'
  },
  {
    id: 'elfo',
    nombre: 'Elfo',
    descripcion: 'Gráciles y longevos. Conectados con la magia natural.',
    imagen: '/img/razas/elfo.png',
    historia: 'Los elfos son una raza antigua y sabia, conocidos por su longevidad y su profunda conexión con la naturaleza y la magia. Viven en armonía con los bosques y las tierras salvajes, protegiendo los secretos de la tierra y sus criaturas. Su cultura está llena de arte, música y poesía, y valoran la belleza y la sabiduría por encima de todo. Los elfos son hábiles arqueros y magos, y su aguda percepción les permite detectar peligros que otros podrían pasar por alto.',
    bonus: { destreza: 2, inteligencia: 1 },
    rasgo: 'Visión nocturna'
  },
  {
    id: 'enano',
    nombre: 'Enano',
    descripcion: 'Robustos y tercos. Maestros de la forja y la piedra.',
    imagen: '/img/razas/enano.png',
    historia: 'Los enanos son una raza resistente y trabajadora, conocidos por su habilidad en la forja y la construcción. Viven en las montañas y cavernas, donde han creado imperios subterráneos y ciudades de piedra. Su orgullo y su sentido del honor los hacen valientes defensores de sus tierras y sus tradiciones.',
    bonus: { constitucion: 2, fuerza: 1 },
    rasgo: 'Resistencia mágica'
  },
  {
    id: 'orco',
    nombre: 'Orco',
    descripcion: 'Salvajes y honorables. La fuerza bruta es su idioma.',
    imagen: '/img/razas/orco.png',
    historia: 'Los orcos son una raza guerrera, conocidos por su fuerza y ferocidad en el combate. Viven en tribus nómadas y valoran la fuerza, el honor y la lealtad por encima de todo. Aunque a menudo son malinterpretados como brutales y sin cultura, los orcos tienen una rica tradición oral y un profundo sentido de comunidad. Su habilidad para sobrevivir en entornos hostiles y su destreza en la batalla los convierte en adversarios formidables.',
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
    habilidadesBase: []
  },
  {
    id: 'mago',
    nombre: 'Mago',
    descripcion: 'Manipula la energía arcana para destruir o controlar.',
    imagen: '/img/clases/mago.png',
    dadoGolpe: 6,
    statPrincipal: 'inteligencia',
    habilidadesBase: []
  },
  {
    id: 'picaro',
    nombre: 'Pícaro',
    descripcion: 'Sigiloso y astuto. Golpea donde más duele.',
    imagen: '/img/clases/picaro.png',
    dadoGolpe: 8,
    statPrincipal: 'destreza',
    habilidadesBase: []
  },
  {
    id: 'clerigo',
    nombre: 'Clérigo',
    descripcion: 'Canaliza el poder divino para sanar o castigar.',
    imagen: '/img/clases/clerigo.png',
    dadoGolpe: 8,
    statPrincipal: 'sabiduria',
    habilidadesBase: []
  }
]

// Habilidades desbloqueadas según clase (para el arreglo dinámico)
export const habilidadesPorClase = {
  guerrero: ['Ataque poderoso', 'Grito de guerra','Embate', 'Postura defensiva', 'Segundo aliento'],
  mago: ['Bola de fuego', 'Escudo arcano','Misil mágico', 'Teletransporte corto', 'Detectar magia'],
  picaro: ['Ataque furtivo', 'Esquivar','Golpe bajo', 'Camuflaje', 'Abrir cerraduras'],
  clerigo: ['Curación', 'Luz divina','Bendición', 'Purificar', 'Escudo sagrado']
}