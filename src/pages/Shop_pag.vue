<template>
  <div>
    <Header />
    <main class="shop-main">
      <div class="shop-container">
        <!-- Sidebar de filtros -->
        <aside class="shop-sidebar">
          <Filters :products="products" @filters-changed="handleFiltersChange" />
        </aside>

        <!-- Área principal de productos -->
        <section class="shop-content">
          <div class="shop-header">
            <h3 class="shop-title">Productos</h3>
            <div class="shop-results">
              {{ filteredProducts.length }} producto{{
                filteredProducts.length !== 1 ? 's' : ''
              }}
              encontrado{{ filteredProducts.length !== 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Componente Products reutilizable -->
          <Products
            :show-title="false"
            :products-list="paginatedProducts"
            :show-stock="true"
            :show-cart-controls="true"
            class="shop-products"
          />

          <!-- Paginador -->
          <Pagination
            :current-page="currentPage"
            :total-items="filteredProducts.length"
            :items-per-page="itemsPerPage"
            @page-change="goToPage"
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
import { ref, computed, onMounted } from 'vue'
import { useProducts } from '@/composables/useProducts'
import { useStripe } from '@/composables/useStripe'

import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Filters from '../components/Filters_comp.vue'
import Products from '../components/Products_comp.vue'
import Pagination from '../components/Pagination_comp.vue'

// Productos de Neon
const { products, loadProducts, loading, error } = useProducts()

// Stripe & Cart
const { addToCart, getCartItemCount } = useStripe()

// Cart visibility
const showCart = ref(false)

onMounted(loadProducts)

// Estado de filtros
const activeFilters = ref({
  categories: [],
  brands: [],
  stock: [],
  priceRange: { min: null, max: null },
})

// Estado de paginación
const currentPage = ref(1)
const itemsPerPage = 15

// Productos filtrados
const filteredProducts = computed(() => {
  let filtered = [...products.value]

  // Filtrar por categorías
  if (activeFilters.value.categories.length > 0) {
    filtered = filtered.filter((product) =>
      activeFilters.value.categories.includes(product.category)
    )
  }

  // Filtrar por marcas
  if (activeFilters.value.brands.length > 0) {
    filtered = filtered.filter((product) => activeFilters.value.brands.includes(product.brand))
  }

  // Filtrar por stock
  if (activeFilters.value.stock.length > 0) {
    filtered = filtered.filter((product) => {
      if (activeFilters.value.stock.includes('inStock') && product.inStock) return true
      if (activeFilters.value.stock.includes('outOfStock') && !product.inStock) return true
      return false
    })
  }

  // Filtrar por rango de precio
  if (activeFilters.value.priceRange.min !== null && activeFilters.value.priceRange.min !== '') {
    filtered = filtered.filter(
      (product) => product.price >= parseFloat(activeFilters.value.priceRange.min)
    )
  }
  if (activeFilters.value.priceRange.max !== null && activeFilters.value.priceRange.max !== '') {
    filtered = filtered.filter(
      (product) => product.price <= parseFloat(activeFilters.value.priceRange.max)
    )
  }

  return filtered
})

// Productos paginados
const paginatedProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredProducts.value.slice(startIndex, endIndex)
})

// Total de páginas
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

// Función para cambiar de página
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Hacer scroll hacia arriba cuando cambias de página
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Reset página cuando cambian filtros
const resetPage = () => {
  currentPage.value = 1
}

// Manejar cambios en filtros
const handleFiltersChange = (filters) => {
  activeFilters.value = filters
  resetPage() // Resetear a página 1 cuando cambian los filtros
}
</script>

<style scoped>
/* Los estilos del paginador ahora están en el componente Pagination_comp.vue */
</style>
