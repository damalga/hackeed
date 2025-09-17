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
import { ref, computed, onMounted } from 'vue'
import { useProducts } from '@/composables/useProducts'
import { useStripe } from '@/composables/useStripe'

import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Filters from '../components/Filters_comp.vue'
import Products from '../components/Products_comp.vue'

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

// Manejar cambios en filtros
const handleFiltersChange = (filters) => {
  activeFilters.value = filters
}
</script>
