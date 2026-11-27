<script setup>
import { reactive, computed } from 'vue'

// 1. Estado reactivo del personaje
const personaje = reactive({
  raza: 'humano', // 'humano', 'elfo', 'enano'
  clase: 'guerrero',
  fuerza: 10,
  destreza: 10,
  // Arreglo dinámico para habilidades
  habilidades: [{ nombre: 'Ataque básico' }]
})

// 2. Cálculo automático (Ejemplo: Modificador de Fuerza)
const modificadorFuerza = computed(() => {
  return Math.floor((personaje.fuerza - 10) / 2)
})

// 3. Función para añadir habilidades (Arreglo en tiempo real)
function agregarHabilidad() {
  personaje.habilidades.push({ nombre: '' })
}

// 4. Función para eliminar
function eliminarHabilidad(index) {
  personaje.habilidades.splice(index, 1)
}
</script>

<template>
  <div class="configurador">
    <h2>Creador de Personajes</h2>

    <!-- Campos condicionales: Si es Elfo, muestra visión nocturna -->
    <div>
      <label>Raza:</label>
      <select v-model="personaje.raza">
        <option value="humano">Humano</option>
        <option value="elfo">Elfo</option>
        <option value="enano">Enano</option>
      </select>
    </div>

    <div v-if="personaje.raza === 'elfo'">
      <p>✨ Visión nocturna (Racial)</p>
    </div>
    <div v-if="personaje.raza === 'enano'">
      <p>⛏️ Resistencia a la magia (Racial)</p>
    </div>

    <!-- Cálculo automático -->
    <div>
      <label>Fuerza: {{ personaje.fuerza }}</label>
      <input type="range" v-model.number="personaje.fuerza" min="1" max="20" />
      <span>Modificador: {{ modificadorFuerza >= 0 ? '+' : '' }}{{ modificadorFuerza }}</span>
    </div>

    <!-- Arreglo dinámico de habilidades -->
    <h3>Habilidades</h3>
    <div v-for="(hab, index) in personaje.habilidades" :key="index">
      <input v-model="hab.nombre" placeholder="Nombre de habilidad" />
      <button @click="eliminarHabilidad(index)">❌</button>
    </div>
    <button @click="agregarHabilidad">+ Añadir Habilidad</button>
  </div>
</template>
