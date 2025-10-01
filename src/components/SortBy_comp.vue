<template>
  <div class="sort-by">
    <span class="sort-label">Ordenar por:</span>
    <div class="custom-select" @click="toggleOpen">
      <div class="selected">{{ labelFor(selectedSort) }}</div>
      <ul v-if="isOpen" class="options">
        <li v-for="opt in options" :key="opt.value" @click.stop="selectOption(opt.value)">
          {{ opt.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'newest',
  },
})

const emit = defineEmits(['update:modelValue', 'sort-change'])

const options = [
  { value: 'newest', label: 'Novedades primero' },
  { value: 'oldest', label: 'Más antiguos primero' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
]

const selectedSort = ref(props.modelValue)
const isOpen = ref(false)

watch(
  () => props.modelValue,
  (newValue) => {
    selectedSort.value = newValue
  }
)

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function selectOption(value) {
  selectedSort.value = value
  isOpen.value = false
  emit('update:modelValue', value)
  emit('sort-change', value)
}

function labelFor(value) {
  return options.find((o) => o.value === value)?.label || ''
}
</script>
