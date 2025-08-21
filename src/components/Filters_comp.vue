<template>
  <div class="shop-filters">
    <h3 class="filters-title">Filtros</h3>
    
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
            :class="{ checked: selectedCategories.includes(category.name) }"
          ></div>
          <span 
            class="filter-label"
            :class="{ active: selectedCategories.includes(category.name) }"
          >
            {{ category.name }}
          </span>
          <span class="filter-count">({{ category.count }})</span>
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
          />
          <span class="price-separator">-</span>
          <input 
            type="number" 
            class="price-input" 
            placeholder="Max"
            v-model="priceRange.max"
            @input="updatePriceFilter"
          />
        </div>
      </div>
    </div>
    
    <!-- Filtro por disponibilidad -->
    <div class="filter-group stock-filter">
      <h4 class="filter-group-title">Disponibilidad</h4>
      <div class="filter-options">
        <div 
          class="filter-option"
          @click="toggleStock('inStock')"
        >
          <div 
            class="filter-checkbox" 
            :class="{ checked: selectedStock.includes('inStock') }"
          ></div>
          <span 
            class="filter-label"
            :class="{ active: selectedStock.includes('inStock') }"
          >
            En stock
          </span>
          <span class="stock-badge in-stock">Disponible</span>
        </div>
        <div 
          class="filter-option"
          @click="toggleStock('outOfStock')"
        >
          <div 
            class="filter-checkbox" 
            :class="{ checked: selectedStock.includes('outOfStock') }"
          ></div>
          <span 
            class="filter-label"
            :class="{ active: selectedStock.includes('outOfStock') }"
          >
            Agotado
          </span>
          <span class="stock-badge out-of-stock">Agotado</span>
        </div>
      </div>
    </div>
    
    <!-- Filtro por características -->
    <div class="filter-group">
      <h4 class="filter-group-title">Características</h4>
      <div class="filter-options">
        <div 
          v-for="feature in features" 
          :key="feature.name"
          class="filter-option"
          @click="toggleFeature(feature.name)"
        >
          <div 
            class="filter-checkbox" 
            :class="{ checked: selectedFeatures.includes(feature.name) }"
          ></div>
          <span 
            class="filter-label"
            :class="{ active: selectedFeatures.includes(feature.name) }"
          >
            {{ feature.name }}
          </span>
          <span class="filter-count">({{ feature.count }})</span>
        </div>
      </div>
    </div>
    
    <!-- Acciones de filtros -->
    <div class="filter-actions">
      <button class="apply-filters-btn" @click="applyFilters">
        Aplicar filtros
      </button>
      <button class="clear-filters-btn" @click="clearAllFilters">
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import products from '@/data/products_data.js'

// Props para comunicar filtros al componente padre
const emit = defineEmits(['filters-changed'])

// Estados de filtros
const selectedCategories = ref([])
const selectedStock = ref([])
const selectedFeatures = ref([])
const priceRange = ref({ min: null, max: null })

// Datos computados para opciones de filtros
const categories = computed(() => {
  const categoryCount = {}
  products.forEach(product => {
    if (product.category) {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
    }
  })
  
  return Object.entries(categoryCount).map(([name, count]) => ({
    name,
    count
  }))
})

const features = computed(() => {
  const featureCount = {}
  products.forEach(product => {
    if (product.features) {
      product.features.forEach(feature => {
        featureCount[feature] = (featureCount[feature] || 0) + 1
      })
    }
  })
  
  return Object.entries(featureCount).map(([name, count]) => ({
    name,
    count
  }))
})

// Funciones de toggle para filtros
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

const toggleFeature = (feature) => {
  const index = selectedFeatures.value.indexOf(feature)
  if (index > -1) {
    selectedFeatures.value.splice(index, 1)
  } else {
    selectedFeatures.value.push(feature)
  }
  emitFilters()
}

const updatePriceFilter = () => {
  emitFilters()
}

// Función para aplicar filtros
const applyFilters = () => {
  emitFilters()
}

// Función para limpiar todos los filtros
const clearAllFilters = () => {
  selectedCategories.value = []
  selectedStock.value = []
  selectedFeatures.value = []
  priceRange.value = { min: null, max: null }
  emitFilters()
}

// Emitir filtros al componente padre
const emitFilters = () => {
  const filters = {
    categories: selectedCategories.value,
    stock: selectedStock.value,
    features: selectedFeatures.value,
    priceRange: priceRange.value
  }
  emit('filters-changed', filters)
}

// Inicializar con todos los productos visibles
onMounted(() => {
  emitFilters()
})
</script>

<style scoped>
/* Estilos incluidos desde _filters.scss */
</style>