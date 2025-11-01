<template>
  <div class="filter-toggle">
    <button class="filter-toggle-btn" @click="toggleFilters">
      <span class="filter-label">Filtros</span>
      <svg
        class="filter-arrow"
        :class="{ open: isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 20"
      >
        <path
          stroke="#00ff00"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M6 8l4 4 4-4"
        />
      </svg>
      <span v-if="activeFiltersCount > 0" class="filter-badge">
        {{ activeFiltersCount }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  activeFiltersCount: {
    type: Number,
    default: 0,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle'])

function toggleFilters() {
  emit('toggle')
}
</script>
