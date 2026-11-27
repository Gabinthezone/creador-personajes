<script setup>
import { ref, watch, onMounted } from 'vue'
import { usePersonaje } from '@/composables/usePersonaje'
import { useGuardado } from '@/composables/useGuardado'
import { habilidadesPorClase } from '@/data/opciones'

const {
  personaje, razas, clases, razaActual, claseActual,
  atributosFinales, modificador, puntosVida, poderTotal,
  agregarHabilidad, eliminarHabilidad, cargarHabilidadesBase, resetear
} = usePersonaje()

const { guardar, listar, cargar, eliminar } = useGuardado()

const guardados = ref([])
const mensaje = ref('')

onMounted(() => { guardados.value = listar() })

// Cuando cambia la clase, sugerir habilidades base
watch(() => personaje.claseId, () => {
  if (personaje.habilidades.length === 0) cargarHabilidadesBase()
})

const habilidadesSugeridas = ref([])
watch(() => personaje.claseId, (nueva) => {
  habilidadesSugeridas.value = habilidadesPorClase[nueva] || []
}, { immediate: true })

function onGuardar() {
  try {
    guardar(personaje)
    guardados.value = listar()
    mensaje.value = '✅ Personaje guardado'
    setTimeout(() => mensaje.value = '', 2500)
  } catch (e) {
    mensaje.value = '⚠️ ' + e.message
    setTimeout(() => mensaje.value = '', 3000)
  }
}

function onCargar(id) {
  const p = cargar(id)
  if (p) {
    Object.assign(personaje, p)
    mensaje.value = '📂 Personaje cargado'
    setTimeout(() => mensaje.value = '', 2000)
  }
}

function onEliminar(id) {
  eliminar(id)
  guardados.value = listar()
}
</script>

<template>
  <div class="app">
    <!-- ============ HEADER ============ -->
    <header class="header">
      <h1>⚔️ Forjador de Héroes</h1>
      <p class="subtitulo">Crea tu leyenda, un atributo a la vez</p>
    </header>

    <!-- Toast de mensajes -->
    <transition name="fade">
      <div v-if="mensaje" class="toast">{{ mensaje }}</div>
    </transition>

    <main class="layout">
      <!-- ============ PANEL IZQUIERDO: CONFIGURACIÓN ============ -->
      <section class="panel-config">
        <!-- Nombre -->
        <fieldset>
          <legend>📜 Identidad</legend>
          <label>
            Nombre del héroe
            <input v-model="personaje.nombre" placeholder="Ej: Thorin Escudo de Roble" maxlength="40" />
          </label>
        </fieldset>

        <!-- Raza -->
        <fieldset>
          <legend>🧬 Raza</legend>
          <div class="grid-opciones">
            <button
              v-for="r in razas"
              :key="r.id"
              class="tarjeta-opcion"
              :class="{ activa: personaje.razaId === r.id }"
              @click="personaje.razaId = r.id"
              type="button"
            >
              <img :src="r.imagen" :alt="r.nombre" class="icono" />
              <span>{{ r.nombre }}</span>
            </button>
          </div>
          <p class="descripcion">{{ razaActual?.descripcion }}</p>
          <p class="rasgo">✦ {{ razaActual?.rasgo }}</p>
        </fieldset>

        <!-- Clase -->
        <fieldset>
          <legend>⚔️ Clase</legend>
          <div class="grid-opciones">
            <button
              v-for="c in clases"
              :key="c.id"
              class="tarjeta-opcion"
              :class="{ activa: personaje.claseId === c.id }"
              @click="personaje.claseId = c.id"
              type="button"
            >
              <img :src="c.imagen" :alt="c.nombre" class="icono" />
              <span>{{ c.nombre }}</span>
            </button>
          </div>
          <p class="descripcion">{{ claseActual?.descripcion }}</p>
        </fieldset>

        <!-- Atributos -->
        <fieldset>
          <legend>🎲 Atributos</legend>
          <div v-for="(valor, stat) in personaje.atributosBase" :key="stat" class="slider-row">
            <label>{{ stat }}</label>
            <input type="range" v-model.number="personaje.atributosBase[stat]" min="8" max="18" />
            <span class="valor">
              {{ atributosFinales[stat] }}
              <small>({{ modificador(stat) >= 0 ? '+' : '' }}{{ modificador(stat) }})</small>
            </span>
          </div>
        </fieldset>

        <!-- Habilidades (arreglo dinámico) -->
        <fieldset>
          <legend>✨ Habilidades</legend>
          <div v-for="hab in personaje.habilidades" :key="hab.id" class="habilidad-row">
            <input v-model="hab.nombre" placeholder="Nombre de habilidad" />
            <button @click="eliminarHabilidad(hab.id)" class="btn-eliminar" type="button">✕</button>
          </div>
          <button @click="agregarHabilidad()" class="btn-agregar" type="button">+ Añadir habilidad</button>

          <div v-if="habilidadesSugeridas.length" class="sugerencias">
            <span class="sugerencias-label">Sugeridas:</span>
            <button
              v-for="sug in habilidadesSugeridas"
              :key="sug"
              @click="agregarHabilidad(sug)"
              class="chip"
              type="button"
            >+ {{ sug }}</button>
          </div>
        </fieldset>

        <!-- Acciones -->
        <div class="acciones">
          <button @click="onGuardar" class="btn-primario" type="button">💾 Guardar personaje</button>
          <button @click="resetear" class="btn-secundario" type="button">🔄 Resetear</button>
        </div>

        <!-- Lista de guardados -->
        <fieldset v-if="guardados.length">
          <legend>📚 Mis personajes guardados</legend>
          <ul class="lista-guardados">
            <li v-for="g in guardados" :key="g.id">
              <span>{{ g.nombre }}</span>
              <div>
                <button @click="onCargar(g.id)" type="button">Cargar</button>
                <button @click="onEliminar(g.id)" class="btn-eliminar" type="button">✕</button>
              </div>
            </li>
          </ul>
        </fieldset>
      </section>

      <!-- ============ PANEL DERECHO: VISTA PREVIA ============ -->
      <aside class="panel-preview">
        <div class="tarjeta-heroe">
          <div class="heroe-header">
            <img :src="claseActual?.imagen" alt="clase" class="heroe-avatar" />
            <div>
              <h2>{{ personaje.nombre || 'Sin nombre' }}</h2>
              <p class="raza-clase">{{ razaActual?.nombre }} · {{ claseActual?.nombre }}</p>
            </div>
          </div>

          <div class="stats-preview">
            <div class="stat-grande">
              <span class="stat-num">{{ puntosVida }}</span>
              <span class="stat-label">PV</span>
            </div>
            <div class="stat-grande">
              <span class="stat-num">{{ poderTotal }}</span>
              <span class="stat-label">Poder</span>
            </div>
            <div class="stat-grande">
              <span class="stat-num">{{ personaje.habilidades.length }}</span>
              <span class="stat-label">Habilidades</span>
            </div>
          </div>

          <div class="atributos-preview">
            <div v-for="(valor, stat) in atributosFinales" :key="stat" class="attr">
              <span class="attr-nombre">{{ stat.slice(0, 3).toUpperCase() }}</span>
              <span class="attr-valor">{{ valor }}</span>
              <span class="attr-mod" :class="{ negativo: modificador(stat) < 0 }">
                {{ modificador(stat) >= 0 ? '+' : '' }}{{ modificador(stat) }}
              </span>
            </div>
          </div>

          <div class="habilidades-preview" v-if="personaje.habilidades.length">
            <h3>Habilidades</h3>
            <ul>
              <li v-for="h in personaje.habilidades" :key="h.id">{{ h.nombre || '—' }}</li>
            </ul>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
:root {
  --bg: #1a1410;
  --panel: #2a1f17;
  --borde: #4a3728;
  --acento: #d4a574;
  --acento-fuerte: #f0c674;
  --texto: #e8dcc8;
  --texto-suave: #a89880;
  --exito: #7cb342;
  --peligro: #c62828;
}

body {
  margin: 0;
  background: var(--bg) url('/img/fondo.jpg') center/cover fixed;
  color: var(--texto);
  font-family: 'Cinzel', 'Georgia', serif;
  min-height: 100vh;
}

.app { max-width: 1400px; margin: 0 auto; padding: 2rem; }

.header { text-align: center; margin-bottom: 2rem; }
.header h1 { font-size: 2.5rem; color: var(--acento-fuerte); text-shadow: 0 0 20px rgba(240,198,116,.3); margin: 0; }
.subtitulo { color: var(--texto-suave); font-style: italic; }

.layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}
@media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }

.panel-config {
  background: var(--panel);
  border: 2px solid var(--borde);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,.5);
}

fieldset {
  border: 1px solid var(--borde);
  border-radius: 8px;
  margin-bottom: 1.25rem;
  padding: 1rem;
}
legend { color: var(--acento-fuerte); font-weight: bold; padding: 0 .5rem; }

label { display: block; margin-bottom: .5rem; color: var(--texto-suave); font-size: .9rem; }

input[type="text"], input:not([type]) {
  width: 100%;
  padding: .6rem;
  background: var(--bg);
  border: 1px solid var(--borde);
  border-radius: 6px;
  color: var(--texto);
  font-family: inherit;
  box-sizing: border-box;
}
input:focus { outline: 2px solid var(--acento); border-color: var(--acento); }

.grid-opciones { display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; }
@media (max-width: 600px) { .grid-opciones { grid-template-columns: repeat(2, 1fr); } }

.tarjeta-opcion {
  background: var(--bg);
  border: 2px solid var(--borde);
  border-radius: 8px;
  padding: .75rem .5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .25rem;
  color: var(--texto);
  font-family: inherit;
  font-size: .85rem;
  transition: all .2s;
}
.tarjeta-opcion:hover { border-color: var(--acento); transform: translateY(-2px); }
.tarjeta-opcion.activa { border-color: var(--acento-fuerte); background: rgba(240,198,116,.1); box-shadow: 0 0 12px rgba(240,198,116,.3); }
.icono { width: 48px; height: 48px; object-fit: contain; }

.descripcion { color: var(--texto-suave); font-size: .9rem; margin: .5rem 0 .25rem; font-style: italic; }
.rasgo { color: var(--acento); font-size: .85rem; margin: 0; }

.slider-row { display: grid; grid-template-columns: 100px 1fr 90px; align-items: center; gap: .75rem; margin-bottom: .5rem; }
.slider-row label { margin: 0; text-transform: capitalize; }
.valor { color: var(--acento-fuerte); font-weight: bold; text-align: right; }
.valor small { color: var(--texto-suave); font-weight: normal; }

.habilidad-row { display: flex; gap: .5rem; margin-bottom: .5rem; }
.btn-eliminar { background: var(--peligro); color: white; border: none; border-radius: 6px; padding: 0 .75rem; cursor: pointer; }
.btn-agregar { background: transparent; border: 1px dashed var(--acento); color: var(--acento); padding: .5rem 1rem; border-radius: 6px; cursor: pointer; width: 100%; margin-top: .25rem; }
.btn-agregar:hover { background: rgba(212,165,116,.1); }

.sugerencias { margin-top: .75rem; display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; }
.sugerencias-label { color: var(--texto-suave); font-size: .85rem; }
.chip { background: var(--borde); border: none; color: var(--texto); padding: .3rem .7rem; border-radius: 12px; cursor: pointer; font-size: .8rem; font-family: inherit; }
.chip:hover { background: var(--acento); color: var(--bg); }

.acciones { display: flex; gap: .75rem; margin: 1.5rem 0; }
.btn-primario, .btn-secundario { flex: 1; padding: .9rem; border: none; border-radius: 8px; cursor: pointer; font-family: inherit; font-weight: bold; font-size: 1rem; transition: all .2s; }
.btn-primario { background: var(--acento-fuerte); color: var(--bg); }
.btn-primario:hover { background: #fff0b0; transform: translateY(-2px); }
.btn-secundario { background: var(--borde); color: var(--texto); }
.btn-secundario:hover { background: #5a4535; }

.lista-guardados { list-style: none; padding: 0; margin: 0; }
.lista-guardados li { display: flex; justify-content: space-between; align-items: center; padding: .5rem; border-bottom: 1px solid var(--borde); }
.lista-guardados button { background: var(--acento); color: var(--bg); border: none; border-radius: 4px; padding: .3rem .7rem; cursor: pointer; margin-left: .4rem; font-family: inherit; }
.lista-guardados .btn-eliminar { background: var(--peligro); color: white; }

/* Vista previa */
.panel-preview { position: sticky; top: 2rem; }

.tarjeta-heroe {
  background: linear-gradient(135deg, #2a1f17 0%, #1a1410 100%);
  border: 2px solid var(--acento);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 0 40px rgba(240,198,116,.2), inset 0 0 60px rgba(0,0,0,.5);
}

.heroe-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--borde); }
.heroe-avatar { width: 72px; height: 72px; object-fit: contain; background: var(--bg); border: 2px solid var(--acento); border-radius: 50%; padding: .25rem; }
.heroe-header h2 { margin: 0; color: var(--acento-fuerte); font-size: 1.4rem; }
.raza-clase { margin: .25rem 0 0; color: var(--texto-suave); font-size: .9rem; }

.stats-preview { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin-bottom: 1.5rem; }
.stat-grande { text-align: center; background: var(--bg); border-radius: 8px; padding: .75rem .25rem; border: 1px solid var(--borde); }
.stat-num { display: block; font-size: 1.75rem; font-weight: bold; color: var(--acento-fuerte); }
.stat-label { font-size: .75rem; color: var(--texto-suave); text-transform: uppercase; letter-spacing: .1em; }

.atributos-preview { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin-bottom: 1.5rem; }
.attr { background: var(--bg); border-radius: 6px; padding: .5rem; text-align: center; border: 1px solid var(--borde); }
.attr-nombre { display: block; font-size: .7rem; color: var(--texto-suave); }
.attr-valor { display: block; font-size: 1.3rem; font-weight: bold; color: var(--texto); }
.attr-mod { font-size: .8rem; color: var(--exito); }
.attr-mod.negativo { color: var(--peligro); }

.habilidades-preview h3 { color: var(--acento-fuerte); font-size: 1rem; margin: 0 0 .5rem; }
.habilidades-preview ul { list-style: none; padding: 0; margin: 0; }
.habilidades-preview li { padding: .4rem .75rem; background: var(--bg); border-left: 3px solid var(--acento); margin-bottom: .4rem; border-radius: 0 4px 4px 0; font-size: .9rem; }

.toast { position: fixed; top: 1.5rem; right: 1.5rem; background: var(--panel); border: 1px solid var(--acento); border-radius: 8px; padding: .75rem 1.25rem; box-shadow: 0 4px 20px rgba(0,0,0,.5); z-index: 100; }
.fade-enter-active, .fade-leave-active { transition: all .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>