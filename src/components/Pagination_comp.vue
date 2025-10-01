<template>
  <div v-if="totalPages > 1" class="pagination">
    <!-- Botón anterior -->
    <button
      v-if="showPrevious"
      @click="goToPreviousPage"
      class="pagination-btn pagination-prev"
      :disabled="currentPage === 1"
    >
      ←
    </button>

    <!-- Información de página -->
    <div class="pagination-info">
      <span class="page-indicator"> Página {{ currentPage }} de {{ totalPages }} </span>
    </div>

    <!-- Botón siguiente -->
    <button
      v-if="showNext"
      @click="goToNextPage"
      class="pagination-btn pagination-next"
      :disabled="currentPage === totalPages"
    >
      →
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    default: 1,
  },
  totalItems: {
    type: Number,
    required: true,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    default: 15,
  },
  showPrevious: {
    type: Boolean,
    default: true,
  },
  showNext: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['page-change'])

// Cálculo de páginas totales
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

// Funciones de navegación
const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}

const goToNextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('page-change', props.currentPage + 1)
  }
}
</script>
