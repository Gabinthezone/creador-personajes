<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePersonaje } from '@/composables/usePersonaje'
import { useGuardado } from '@/composables/useGuardado'
import { habilidadesPorClase, razas, clases } from '@/data/opciones'

const {
  personaje, razas: razasList, clases: clasesList, razaActual, claseActual,
  atributosFinales, modificador, puntosVida, poderTotal,
  agregarHabilidad, eliminarHabilidad, cargarHabilidadesBase, resetear
} = usePersonaje()

const { guardar, listar, cargar, eliminar } = useGuardado()

const guardados = ref([])
const mensaje = ref('')
const mostrarModal = ref(false)
const idAEliminar = ref(null)
let timer = null

// Las imágenes viven en public/img/razas/ y public/img/clases/
const normalizar = (t = '') => t.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const img = (item, carpeta) =>
  item ? `${import.meta.env.BASE_URL}img/${carpeta}/${normalizar(item.nombre || item.id)}.png` : ''
const ocultarSiFalla = (e) => { e.target.style.visibility = 'hidden' }

const habilidadesSugeridas = computed(() => {
  const todas = habilidadesPorClase[personaje.claseId] || []
  // Filtramos: solo dejamos las que NO estén ya en el arreglo de personaje.habilidades
  return todas.filter(sug => 
    !personaje.habilidades.some(h => h.nombre === sug)
  )
})

onMounted(() => { guardados.value = listar() })

// --- LÓGICA DE ALEATORIEDAD ---
function generarAleatorio() {
  // 1. Elegir nombre aleatorio simple (puedes expandir esta lista)
  const nombres = ['Aragorn', 'Legolas', 'Gimli', 'Gandalf', 'Frodo', 'Arwen', 'Thorin', 'Elrond', 'Sauron', 'Galadriel']
  const nombresAleatorios = nombres[Math.floor(Math.random() * nombres.length)]

  // 2. Elegir raza y clase aleatoria
  const razaAleatoria = razasList[Math.floor(Math.random() * razasList.length)]
  const claseAleatoria = clasesList[Math.floor(Math.random() * clasesList.length)]

  // 3. Elegir atributos aleatorios (entre 8 y 18)
  const atributosAleatorios = {}
  Object.keys(personaje.atributosBase).forEach(stat => {
    atributosAleatorios[stat] = Math.floor(Math.random() * 11) + 8 // 8 a 18
  })

  // 4. Aplicar los cambios al personaje reactivo
  personaje.nombre = nombresAleatorios + ' el ' + razaAleatoria.nombre
  personaje.razaId = razaAleatoria.id
  personaje.claseId = claseAleatoria.id
  Object.assign(personaje.atributosBase, atributosAleatorios)

  // 5. Cargar las 2 habilidades base de la clase elegida
  cargarHabilidadesBase() 
  
  avisar('Personaje aleatorio generado')
}

// Al cambiar de clase: se reemplazan las habilidades de clase
const HABILIDADES_BASE = 2
const todasLasDeClase = Object.values(habilidadesPorClase).flat()

function elegirClase(id) {
  if (id === personaje.claseId) return
  personaje.habilidades
    .filter((h) => todasLasDeClase.includes(h.nombre))
    .forEach((h) => eliminarHabilidad(h.id))
  personaje.claseId = id
  ;(habilidadesPorClase[id] || []).slice(0, HABILIDADES_BASE).forEach((nombre) => {
    if (!personaje.habilidades.some((h) => h.nombre === nombre)) agregarHabilidad(nombre)
  })
}

// Botones + / − de atributos
const ATTR_MIN = 8
const ATTR_MAX = 18
function cambiarAtributo(stat, delta) {
  const nuevo = personaje.atributosBase[stat] + delta
  personaje.atributosBase[stat] = Math.min(ATTR_MAX, Math.max(ATTR_MIN, nuevo))
}

function avisar(texto, ms = 2500) {
  mensaje.value = texto
  clearTimeout(timer)
  timer = setTimeout(() => (mensaje.value = ''), ms)
}

function onGuardar() {
  try {
    guardar(personaje)
    guardados.value = listar()
    avisar('Personaje guardado')
  } catch (e) {
    avisar(e.message, 3000)
  }
}

function onCargar(id) {
  const p = cargar(id)
  if (p) {
    Object.assign(personaje, p)
    avisar('Personaje cargado')
  }
}

function onEliminar(id) {
  idAEliminar.value = id
  mostrarModal.value = true
}

function confirmarEliminar() {
  eliminar(idAEliminar.value)
  guardados.value = listar()
  mostrarModal.value = false
  idAEliminar.value = null
  avisar('Personaje eliminado')
}

function cancelarEliminar() {
  mostrarModal.value = false
  idAEliminar.value = null
}

const signo = (stat) => (modificador(stat) >= 0 ? '+' : '') + modificador(stat)
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Forjador de Héroes</h1>
      <p>Crea tu leyenda, un atributo a la vez.</p>
      <!-- BOTÓN ALEATORIO -->
      <button type="button" class="btn-aleatorio" @click="generarAleatorio">
         Personaje aleatorio
      </button>
    </header>

    <transition name="fade">
      <div v-if="mensaje" class="toast" role="status">{{ mensaje }}</div>
    </transition>

    <main class="layout">
      <section class="config">
        <div class="bloque">
          <h2>Nombre</h2>
          <input
            v-model="personaje.nombre"
            placeholder="Ej: Thorin Escudo de Roble"
            maxlength="40"
          />
        </div>

        <div class="par">
          <div class="bloque">
            <h2>Raza</h2>
            <div class="opciones">
              <button
                v-for="r in razasList"
                :key="r.id"
                type="button"
                class="opcion"
                :class="{ activa: personaje.razaId === r.id }"
                :aria-pressed="personaje.razaId === r.id"
                @click="personaje.razaId = r.id"
              >
                <img :src="img(r, 'razas')" :alt="r.nombre" @error="ocultarSiFalla" />
                <span>{{ r.nombre }}</span>
              </button>
            </div>
            <p class="detalle">{{ razaActual?.descripcion }}</p>
            <p v-if="razaActual?.rasgo" class="rasgo">{{ razaActual.rasgo }}</p>
          </div>

          <div class="bloque">
            <h2>Clase</h2>
            <div class="opciones">
              <button
                v-for="c in clasesList"
                :key="c.id"
                type="button"
                class="opcion"
                :class="{ activa: personaje.claseId === c.id }"
                :aria-pressed="personaje.claseId === c.id"
                @click="elegirClase(c.id)"
              >
                <img :src="img(c, 'clases')" :alt="c.nombre" @error="ocultarSiFalla" />
                <span>{{ c.nombre }}</span>
              </button>
            </div>
            <p class="detalle">{{ claseActual?.descripcion }}</p>
          </div>
        </div>

        <!-- Resumen de Atributos -->
        <div class="bloque">
          <h2>Atributos</h2>
          <div v-for="(valor, stat) in personaje.atributosBase" :key="stat" class="slider">
            <label :for="'attr-' + stat">{{ stat }}</label>
            <input
              :id="'attr-' + stat"
              type="range"
              :min="ATTR_MIN"
              :max="ATTR_MAX"
              v-model.number="personaje.atributosBase[stat]"
            />
            <div class="paso">
              <button
                type="button"
                :aria-label="'Disminuir ' + stat"
                :disabled="personaje.atributosBase[stat] <= ATTR_MIN"
                @click="cambiarAtributo(stat, -1)"
              >−</button>
              <button
                type="button"
                :aria-label="'Aumentar ' + stat"
                :disabled="personaje.atributosBase[stat] >= ATTR_MAX"
                @click="cambiarAtributo(stat, 1)"
              >+</button>
            </div>
            <span class="valor">
              {{ atributosFinales[stat] }}
              <small>{{ signo(stat) }}</small>
            </span>
          </div>
        </div>

        <div class="bloque">
          <h2>Habilidades</h2>
          <div v-for="hab in personaje.habilidades" :key="hab.id" class="habilidad">
            <input v-model="hab.nombre" placeholder="Nombre de la habilidad" />
            <button type="button" class="quitar" aria-label="Quitar habilidad" @click="eliminarHabilidad(hab.id)">✕</button>
          </div>
          <button type="button" class="agregar" @click="agregarHabilidad()">Añadir habilidad</button>

          <div v-if="habilidadesSugeridas.length" class="sugeridas">
            <span>Sugeridas</span>
            <button
              v-for="sug in habilidadesSugeridas"
              :key="sug"
              type="button"
              class="chip"
              @click="agregarHabilidad(sug)"
            >{{ sug }}</button>
          </div>
        </div>

        <div class="acciones">
          <button type="button" class="primario" @click="onGuardar">Guardar personaje</button>
          <button type="button" class="secundario" @click="resetear">Resetear</button>
        </div>

        <div v-if="guardados.length" class="bloque">
          <h2>Mis personajes</h2>
          <ul class="guardados">
            <li v-for="g in guardados" :key="g.id">
              <span>{{ g.nombre || 'Sin nombre' }}</span>
              <div>
                <button type="button" class="enlace" @click="onCargar(g.id)">Cargar</button>
                <button type="button" class="enlace peligro" @click="onEliminar(g.id)">Eliminar</button>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Vista previa -->
      <aside class="preview">
        <div class="heroe">
          <div class="heroe-cabecera">
            <img :src="img(claseActual, 'clases')" alt="" class="avatar" @error="ocultarSiFalla" />
            <div>
              <h2>{{ personaje.nombre || 'Sin nombre' }}</h2>
              <p>{{ razaActual?.nombre }} {{ claseActual?.nombre }}</p>
            </div>
          </div>

          <!-- NUEVO: Fragmento de la historia de la raza -->
          <p v-if="razaActual?.historia" class="historia">
             {{ razaActual.historia }}
          </p>

          <div class="resumen">
            <div><strong>{{ puntosVida }}</strong><span>Vida</span></div>
            <div><strong>{{ poderTotal }}</strong><span>Poder</span></div>
            <div><strong>{{ personaje.habilidades.length }}</strong><span>Habilidades</span></div>
          </div>

          <dl class="atributos">
            <div v-for="(valor, stat) in atributosFinales" :key="stat">
              <dt>{{ stat }}</dt>
              <dd>
                {{ valor }}
                <small :class="{ negativo: modificador(stat) < 0 }">{{ signo(stat) }}</small>
              </dd>
            </div>
          </dl>

          <ul v-if="personaje.habilidades.length" class="lista-habilidades">
            <li v-for="h in personaje.habilidades" :key="h.id">{{ h.nombre || '—' }}</li>
          </ul>
        </div>
      </aside>
    </main>
  </div>
      <!-- Modal de confirmación -->
    <transition name="fade">
      <div v-if="mostrarModal" class="modal-overlay" @click.self="cancelarEliminar">
        <div class="modal-caja">
          <h3>Eliminar personaje</h3>
          <p>¿Estás seguro de que quieres eliminar este personaje? Esta acción no se puede deshacer.</p>
          <div class="modal-acciones">
            <button type="button" class="secundario" @click="cancelarEliminar">Cancelar</button>
            <button type="button" class="btn-peligro" @click="confirmarEliminar">Sí, eliminar</button>
          </div>
        </div>
      </div>
    </transition>
</template>

<!-- Estilos globales (el bloque scoped no puede definir :root ni body) -->
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600&display=swap');

:root {
  --bg: #14110f;
  --superficie: #1c1814;
  --elevada: #25201a;
  --linea: #2f2822;
  --texto: #ece3d3;
  --suave: #9a8d7a;
  --acento: #d9b26f;
  --peligro: #c4574a;
  --bien: #8fae6b;
}

body {
  margin: 0;
  background:
    linear-gradient(rgba(20, 17, 15, .82), rgba(20, 17, 15, .92)),
    var(--bg) url('/img/fondo.png') center / cover fixed no-repeat;
  color: var(--texto);
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.5;
  min-height: 100vh;
}

* { box-sizing: border-box; }

html body { display: block; place-items: unset; }
html body #app {
  display: block;
  grid-template-columns: none;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  font-weight: 400;
  text-align: left;
}
</style>

<style scoped>
/* ... (Tus estilos existentes se mantienen intactos) ... */
.app { width: 100%; max-width: 1180px; margin: 0 auto; padding: 2.5rem 1.5rem 3rem; }

/* Encabezado */
.header { text-align: center; margin-bottom: 2rem; }
.header h1 {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 2.25rem;
  letter-spacing: .02em;
  color: var(--acento);
  margin: 0 0 .25rem;
}
.header p { margin: 0; color: var(--suave); }

/* NUEVO: Botón de aleatorio */
.btn-aleatorio {
  margin-top: 1rem;
  padding: .6rem 1.2rem;
  background: transparent;
  border: 1px solid var(--acento);
  border-radius: 8px;
  color: var(--acento);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, color .15s;
}
.btn-aleatorio:hover {
  background: var(--acento);
  color: var(--bg);
}

/* Layout */
.layout { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 2.5rem; align-items: start; }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; gap: 2rem; } }

/* Bloques */
.bloque { padding-bottom: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--linea); }
.bloque h2 {
  font-family: 'Cinzel', serif;
  font-weight: 500;
  font-size: 1.05rem;
  margin: 0 0 1rem;
  color: var(--texto);
}

/* Inputs */
input:not([type='range']) {
  width: 100%;
  padding: .7rem .85rem;
  background: var(--superficie);
  border: 1px solid var(--linea);
  border-radius: 8px;
  color: var(--texto);
  font: inherit;
  transition: border-color .15s;
}
input::placeholder { color: var(--suave); opacity: .7; }
input:focus-visible, button:focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }
input:not([type='range']):focus { border-color: var(--acento); }

/* Raza / clase */
.par { display: grid; grid-template-columns: 1fr 1fr; column-gap: 2rem; }
.par .bloque { min-width: 0; }
@media (max-width: 700px) { .par { grid-template-columns: 1fr; } }

.opciones { display: grid; grid-template-columns: repeat(2, 1fr); gap: .75rem; }

.opcion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  padding: 1rem .5rem .75rem;
  background: var(--superficie);
  border: 1px solid transparent;
  border-radius: 10px;
  color: var(--suave);
  font: inherit;
  font-size: .875rem;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
}
.opcion img { width: 72px; height: 72px; object-fit: contain; opacity: .7; transition: opacity .15s; }
.opcion:hover { background: var(--elevada); color: var(--texto); }
.opcion:hover img { opacity: 1; }
.opcion.activa { background: var(--elevada); border-color: var(--acento); color: var(--texto); }
.opcion.activa img { opacity: 1; }

.detalle { margin: 1rem 0 0; color: var(--suave); font-size: .9rem; max-width: 60ch; }
.rasgo { margin: .35rem 0 0; color: var(--acento); font-size: .875rem; }

/* Atributos */
.slider { display: grid; grid-template-columns: 110px minmax(0, 1fr) auto 70px; align-items: center; gap: 1rem; margin-bottom: .75rem; }
.paso { display: flex; gap: .35rem; }
.paso button {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  padding: 0;
  background: var(--superficie);
  border: 1px solid var(--linea);
  border-radius: 6px;
  color: var(--texto);
  font: inherit;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: border-color .15s, color .15s;
}
.paso button:hover:not(:disabled) { border-color: var(--acento); color: var(--acento); }
.paso button:disabled { opacity: .3; cursor: not-allowed; }
.slider label { color: var(--suave); font-size: .9rem; text-transform: capitalize; }
.slider input[type='range'] { width: 100%; accent-color: var(--acento); }
.valor { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
.valor small { color: var(--suave); font-weight: 400; margin-left: .25rem; }

/* Habilidades */
.habilidad { display: flex; gap: .5rem; margin-bottom: .5rem; }
.quitar {
  width: 40px;
  background: transparent;
  border: 1px solid var(--linea);
  border-radius: 8px;
  color: var(--suave);
  cursor: pointer;
  transition: color .15s, border-color .15s;
}
.quitar:hover { color: var(--peligro); border-color: var(--peligro); }

.agregar {
  width: 100%;
  margin-top: .25rem;
  padding: .6rem;
  background: transparent;
  border: 1px dashed var(--linea);
  border-radius: 8px;
  color: var(--suave);
  font: inherit;
  cursor: pointer;
  transition: color .15s, border-color .15s;
}
.agregar:hover { color: var(--acento); border-color: var(--acento); }

.sugeridas { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: 1rem; }
.sugeridas span { color: var(--suave); font-size: .85rem; margin-right: .25rem; }
.chip {
  padding: .3rem .8rem;
  background: var(--superficie);
  border: 1px solid var(--linea);
  border-radius: 999px;
  color: var(--texto);
  font: inherit;
  font-size: .8rem;
  cursor: pointer;
  transition: border-color .15s, color .15s;
}
.chip:hover { border-color: var(--acento); color: var(--acento); }

/* Acciones */
.acciones { display: flex; gap: .75rem; margin-bottom: 2rem; }
.primario, .secundario {
  flex: 1;
  padding: .8rem;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.primario { background: var(--acento); border: 1px solid var(--acento); color: var(--bg); }
.primario:hover { background: #e6c283; }
.secundario { background: transparent; border: 1px solid var(--linea); color: var(--texto); }
.secundario:hover { border-color: var(--suave); }

/* Guardados */
.guardados { list-style: none; margin: 0; padding: 0; }
.guardados li { display: flex; justify-content: space-between; align-items: center; padding: .6rem 0; border-bottom: 1px solid var(--linea); }
.guardados li:last-child { border-bottom: none; }
.enlace { background: none; border: none; color: var(--acento); font: inherit; font-size: .875rem; cursor: pointer; padding: .25rem .5rem; }
.enlace:hover { text-decoration: underline; }
.enlace.peligro { color: var(--suave); }
.enlace.peligro:hover { color: var(--peligro); }

/* Vista previa */
.preview { position: sticky; top: 2rem; }
@media (max-width: 900px) { .preview { position: static; } }

.heroe {
  background: rgba(28, 24, 20, .88);
  backdrop-filter: blur(6px);
  border: 1px solid var(--linea);
  border-radius: 14px;
  padding: 1.75rem;
}
.heroe-cabecera { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.avatar { width: 88px; height: 88px; object-fit: contain; background: var(--elevada); border-radius: 50%; padding: .4rem; }
.heroe-cabecera h2 { margin: 0; font-family: 'Cinzel', serif; font-size: 1.25rem; color: var(--acento); overflow-wrap: anywhere; }
.heroe-cabecera p { margin: .15rem 0 0; color: var(--suave); font-size: .9rem; }

/* NUEVO: Historia de la raza */
.historia {
  margin: 0 0 1.5rem;
  padding: .75rem 1rem;
  background: var(--superficie);
  border-left: 3px solid var(--acento);
  border-radius: 0 8px 8px 0;
  font-size: .85rem;
  line-height: 1.6;
  color: var(--suave);
  font-style: italic;
}

.resumen { display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; padding: 1rem 0; border-block: 1px solid var(--linea); margin-bottom: 1.5rem; }
.resumen strong { display: block; font-size: 1.6rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.resumen span { color: var(--suave); font-size: .8rem; }

.atributos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem .5rem; margin: 0 0 1.5rem; }
.atributos div { text-align: center; }
.atributos dt { color: var(--suave); font-size: .75rem; text-transform: capitalize; }
.atributos dd { margin: 0; font-size: 1.15rem; font-weight: 600; }
.atributos small { font-size: .75rem; font-weight: 400; color: var(--bien); }
.atributos small.negativo { color: var(--peligro); }

.lista-habilidades { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: .4rem; }
.lista-habilidades li { padding: .25rem .7rem; background: var(--elevada); border-radius: 999px; font-size: .8rem; }

/* Toast */
.toast {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 100;
  padding: .7rem 1.1rem;
  background: var(--elevada);
  border: 1px solid var(--linea);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .4);
  font-size: .9rem;
}
.fade-enter-active, .fade-leave-active { transition: opacity .25s, transform .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .7);
  backdrop-filter: blur(3px);
  display: grid;
  place-items: center;
  z-index: 200;
  padding: 1rem;
}

.modal-caja {
  background: var(--superficie);
  border: 1px solid var(--linea);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, .5);
}

.modal-caja h3 {
  font-family: 'Cinzel', serif;
  color: var(--acento);
  margin: 0 0 .75rem;
  font-size: 1.25rem;
}

.modal-caja p {
  color: var(--suave);
  margin: 0 0 1.5rem;
  font-size: .95rem;
  line-height: 1.5;
}

.modal-acciones {
  display: flex;
  gap: .75rem;
}

.btn-peligro {
  flex: 1;
  padding: .8rem;
  background: var(--peligro);
  border: 1px solid var(--peligro);
  border-radius: 8px;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s;
}

.btn-peligro:hover {
  opacity: .85;
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
</style>