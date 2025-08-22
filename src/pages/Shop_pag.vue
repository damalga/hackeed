<template>
  <div>
    <Header />
    <main class="shop-main">
      <div class="shop-container">
        <!-- Sidebar de filtros -->
        <aside class="shop-sidebar">
          <Filters @filters-changed="handleFiltersChange" />
        </aside>
        
        <!-- Área principal de productos -->
        <section class="shop-content">
          <div class="shop-header">
            <h1 class="shop-title">Productos top hacker</h1>
            <div class="shop-results">
              {{ filteredProducts.length }} producto{{ filteredProducts.length !== 1 ? 's' : '' }} encontrado{{ filteredProducts.length !== 1 ? 's' : '' }}
            </div>
          </div>
          
          <!-- Componente Products reutilizable -->
          <Products 
            :show-title="false"
            :products-list="filteredProducts"
            :show-stock="true"
            :show-cart-controls="true"
            class="shop-products"
          />
          
          <!-- Mensaje si no hay productos -->
          <div v-if="filteredProducts.length === 0" class="no-products">
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar los filtros para ver más resultados.</p>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import products from '../data/products_data.js'

import Header from "../components/Header_comp.vue"
import Footer from "../components/Footer_comp.vue"
import Filters from "../components/Filters_comp.vue"
import Products from "../components/Products_comp.vue"

// Estado de filtros
const activeFilters = ref({
  categories: [],
  stock: [],
  features: [],
  priceRange: { min: null, max: null }
})

// Productos filtrados
const filteredProducts = computed(() => {
  let filtered = [...products]
  
  // Filtrar por categorías
  if (activeFilters.value.categories.length > 0) {
    filtered = filtered.filter(product => 
      activeFilters.value.categories.includes(product.category)
    )
  }
  
  // Filtrar por stock
  if (activeFilters.value.stock.length > 0) {
    filtered = filtered.filter(product => {
      if (activeFilters.value.stock.includes('inStock') && product.inStock) return true
      if (activeFilters.value.stock.includes('outOfStock') && !product.inStock) return true
      return false
    })
  }
  
  // Filtrar por características
  if (activeFilters.value.features.length > 0) {
    filtered = filtered.filter(product =>
      product.features && activeFilters.value.features.some(feature =>
        product.features.includes(feature)
      )
    )
  }
  
  // Filtrar por rango de precio
  if (activeFilters.value.priceRange.min !== null) {
    filtered = filtered.filter(product => product.price >= activeFilters.value.priceRange.min)
  }
  if (activeFilters.value.priceRange.max !== null) {
    filtered = filtered.filter(product => product.price <= activeFilters.value.priceRange.max)
  }
  
  return filtered
})

// Manejar cambios en filtros
const handleFiltersChange = (filters) => {
  activeFilters.value = filters
}
</script>

<style scoped>
/* Estilos específicos para la página shop */
.shop-products {
  padding: 0; /* Eliminar padding del componente en shop */
}

.no-products {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.no-products h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 15px;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
}

.no-products p {
  font-size: 16px;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
}
</style>