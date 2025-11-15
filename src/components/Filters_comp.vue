<template>
  <div class="shop-filters" :class="{ 'is-open': isOpen }">
    <div class="filters-header">
      <h5 class="filters-title">Filtros</h5>
      <button class="filters-close" @click="$emit('close')" aria-label="Cerrar filtros">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width="24"
          height="24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Filtro por categoría -->
    <div class="filter-group">
      <h4 class="filter-group-title">Categoría</h4>
      <div class="filter-options">
        <div
          v-for="category in categories"
          :key="category.name"
          class="filter-option"
          @click="toggleCategory(category.name)"
        >
          <div
            class="filter-checkbox"
            :class="{
              checked: selectedCategories.includes(category.name),
            }"
          ></div>
          <span
            class="filter-label"
            :class="{
              active: selectedCategories.includes(category.name),
            }"
          >
            {{ category.name }}
          </span>
          <span class="filter-count">({{ category.count }})</span>
        </div>
      </div>
    </div>

    <!-- Filtro por marca -->
    <div class="filter-group">
      <h4 class="filter-group-title">Marca</h4>
      <div class="filter-options">
        <div
          v-for="brand in brands"
          :key="brand.name"
          class="filter-option"
          @click="toggleBrand(brand.name)"
        >
          <div
            class="filter-checkbox"
            :class="{
              checked: selectedBrands.includes(brand.name),
            }"
          ></div>
          <span
            class="filter-label"
            :class="{
              active: selectedBrands.includes(brand.name),
            }"
          >
            {{ brand.name }}
          </span>
          <span class="filter-count">({{ brand.count }})</span>
        </div>
      </div>
    </div>

    <!-- Filtro por rango de precio -->
    <div class="filter-group">
      <h4 class="filter-group-title">Precio</h4>
      <div class="price-range">
        <div class="price-inputs">
          <input
            type="number"
            class="price-input"
            placeholder="Min"
            v-model="priceRange.min"
            @input="updatePriceFilter"
            @blur="updatePriceFilter"
          />
          <input
            type="number"
            class="price-input"
            placeholder="Max"
            v-model="priceRange.max"
            @input="updatePriceFilter"
            @blur="updatePriceFilter"
          />
        </div>
      </div>
    </div>

    <!-- Filtro por disponibilidad -->
    <div class="filter-group stock-filter">
      <h4 class="filter-group-title">Disponibilidad</h4>
      <div class="filter-options">
        <div class="filter-option" @click="toggleStock('inStock')">
          <div
            class="filter-checkbox"
            :class="{ checked: selectedStock.includes('inStock') }"
          ></div>
          <span class="filter-label" :class="{ active: selectedStock.includes('inStock') }">
            Disponible
          </span>
          <span class="stock-badge in-stock">Disponible</span>
        </div>
        <div class="filter-option" @click="toggleStock('outOfStock')">
          <div
            class="filter-checkbox"
            :class="{
              checked: selectedStock.includes('outOfStock'),
            }"
          ></div>
          <span
            class="filter-label"
            :class="{
              active: selectedStock.includes('outOfStock'),
            }"
          >
            Agotado
          </span>
          <span class="stock-badge out-of-stock">Agotado</span>
        </div>
      </div>
    </div>

    <!-- Acciones de filtros -->
    <div class="filter-actions">
      <button class="apply-filters-btn" @click="applyFilters">Aplicar filtros</button>
      <button class="clear-filters-btn" @click="clearAllFilters">Limpiar filtros</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  products: { type: Array, default: () => [] },
  isOpen: { type: Boolean, default: true },
})

// Props para comunicar filtros al componente padre
const emit = defineEmits(['filters-changed', 'close'])

// Estados de filtros
const selectedCategories = ref([])
const selectedBrands = ref([])
const selectedStock = ref([])
const priceRange = ref({ min: null, max: null })

// Datos computados para opciones de filtros
// Categorias - ahora soporta múltiples categorías por producto
const categories = computed(() => {
  const categoryCount = {}
  props.products.forEach((product) => {
    // Si category es un array, contar cada categoría
    if (Array.isArray(product.category)) {
      product.category.forEach((category) => {
        if (category) {
          categoryCount[category] = (categoryCount[category] || 0) + 1
        }
      })
    }
    // Compatibilidad con formato antiguo (category como string)
    else if (product.category) {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
    }
  })

  return Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      // Primero por cantidad (descendente)
      if (b.count !== a.count) {
        return b.count - a.count
      }
      // En caso de empate, orden alfabético (ascendente)
      return a.name.localeCompare(b.name)
    })
})

const brands = computed(() => {
  const brandCount = {}
  props.products.forEach((product) => {
    if (product.brand) {
      brandCount[product.brand] = (brandCount[product.brand] || 0) + 1
    }
  })

  return Object.entries(brandCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      // Primero por cantidad (descendente)
      if (b.count !== a.count) {
        return b.count - a.count
      }
      // En caso de empate, orden alfabético (ascendente)
      return a.name.localeCompare(b.name)
    })
})

// Funciones de toggle para filtros
const toggleBrand = (brand) => {
  const index = selectedBrands.value.indexOf(brand)
  if (index > -1) {
    selectedBrands.value.splice(index, 1)
  } else {
    selectedBrands.value.push(brand)
  }
  emitFilters()
}

const toggleCategory = (category) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
  emitFilters()
}

const toggleStock = (stockStatus) => {
  const index = selectedStock.value.indexOf(stockStatus)
  if (index > -1) {
    selectedStock.value.splice(index, 1)
  } else {
    selectedStock.value.push(stockStatus)
  }
  emitFilters()
}

const updatePriceFilter = () => {
  // Convert empty strings to null for proper filtering
  if (priceRange.value.min === '') {
    priceRange.value.min = null
  }
  if (priceRange.value.max === '') {
    priceRange.value.max = null
  }
  emitFilters()
}

// Función para aplicar filtros
const applyFilters = () => {
  emitFilters()
}

// Función para limpiar todos los filtros
const clearAllFilters = () => {
  selectedCategories.value = []
  selectedBrands.value = []
  selectedStock.value = []
  priceRange.value = { min: null, max: null }
  emitFilters()
}

// Emitir filtros al componente padre
const emitFilters = () => {
  const filters = {
    categories: selectedCategories.value,
    brands: selectedBrands.value,
    stock: selectedStock.value,
    priceRange: priceRange.value,
  }
  emit('filters-changed', filters)
}

// Inicializar con todos los productos visibles
onMounted(() => {
  emitFilters()
})
</script>
