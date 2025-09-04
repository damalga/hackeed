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
            <h1 class="shop-title">Productos</h1>
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
  brands: [],
  stock: [],
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

  // Filtrar por marcas
  if (activeFilters.value.brands.length > 0) {
    filtered = filtered.filter(product =>
      activeFilters.value.brands.includes(product.brand)
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

  // Filtrar por rango de precio
  if (activeFilters.value.priceRange.min !== null && activeFilters.value.priceRange.min !== '') {
    filtered = filtered.filter(product => product.price >= parseFloat(activeFilters.value.priceRange.min))
  }
  if (activeFilters.value.priceRange.max !== null && activeFilters.value.priceRange.max !== '') {
    filtered = filtered.filter(product => product.price <= parseFloat(activeFilters.value.priceRange.max))
  }

  return filtered
})

// Manejar cambios en filtros
const handleFiltersChange = (filters) => {
  activeFilters.value = filters
}
</script>
