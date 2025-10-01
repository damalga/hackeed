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
            <div class="shop-controls">
              <div class="shop-results">
                <span class="results-current">
                  Mostrando {{ startIndex + 1 }}-{{ endIndex }} de
                  {{ sortedProducts.length }} Productos
                </span>
              </div>
              <SortBy v-model="sortBy" @sort-change="handleSortChange" />
            </div>
          </div>

          <!-- Componente Products reutilizable -->
          <Products
            :show-title="false"
            :products-list="sortedAndPaginatedProducts"
            :show-stock="true"
            :show-cart-controls="true"
            class="shop-products"
          />

          <!-- Paginador -->
          <Pagination
            :current-page="currentPage"
            :total-items="sortedProducts.length"
            :items-per-page="itemsPerPage"
            @page-change="goToPage"
          />

          <!-- Mensaje si no hay productos -->
          <div v-if="sortedProducts.length === 0" class="no-products">
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
import { usePageMeta } from '@/composables/usePageMeta'

import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Filters from '../components/Filters_comp.vue'
import Products from '../components/Products_comp.vue'
import Pagination from '../components/Pagination_comp.vue'
import SortBy from '../components/SortBy_comp.vue'

// SEO Meta Tags
usePageMeta({
  title: 'Tienda - Comprar Herramientas de Hacking y Pentesting | Hackeed',
  description:
    'Explora nuestro catálogo completo de hardware hacking: Flipper Zero, Raspberry Pi, Hak5, RTL-SDR y más. Stock actualizado diariamente. Envíos en 24h desde España.',
  keywords:
    'comprar flipper zero, tienda raspberry pi, hak5 españa, herramientas pentesting, productos hacking, gadgets ciberseguridad',
  url: 'https://hackeed.com/shop',
  image: 'https://hackeed.com/images/og-shop.jpg',
})

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
const itemsPerPage = 16

// Estado de ordenamiento
const sortBy = ref('newest')

// Contador de filtros activos
const activeFiltersCount = computed(() => {
  let count = 0
  if (activeFilters.value.categories.length > 0) count++
  if (activeFilters.value.brands.length > 0) count++
  if (activeFilters.value.stock.length > 0) count++
  if (activeFilters.value.priceRange.min !== null && activeFilters.value.priceRange.min !== '')
    count++
  if (activeFilters.value.priceRange.max !== null && activeFilters.value.priceRange.max !== '')
    count++
  return count
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

// Función para obtener conteo de productos por categoría/marca
const getCategoryCount = (category) => {
  return filteredProducts.value.filter((product) => product.category === category).length
}

const getBrandCount = (brand) => {
  return filteredProducts.value.filter((product) => product.brand === brand).length
}

// Productos ordenados
const sortedProducts = computed(() => {
  const sorted = [...filteredProducts.value]

  switch (sortBy.value) {
    case 'newest':
      // Ordenar por fecha de creación (productos más recientes primero)
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    case 'oldest':
      // Ordenar por fecha de creación (productos más antiguos primero)
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    case 'category':
      // OPCIÓN 1: Ordenar por cantidad de productos en la categoría (más productos primero)
      return sorted.sort((a, b) => {
        const countA = getCategoryCount(a.category)
        const countB = getCategoryCount(b.category)
        if (countA !== countB) {
          return countB - countA
        }
        // Si tienen el mismo count, ordenar alfabéticamente por categoría
        return a.category.localeCompare(b.category)
      })

    // ALTERNATIVA más intuitiva - descomentar para usar:
    // return sorted.sort((a, b) => a.category.localeCompare(b.category))

    case 'brand':
      // OPCIÓN 1: Ordenar por cantidad de productos de la marca (más productos primero)
      return sorted.sort((a, b) => {
        const countA = getBrandCount(a.brand)
        const countB = getBrandCount(b.brand)
        if (countA !== countB) {
          return countB - countA
        }
        // Si tienen el mismo count, ordenar alfabéticamente por marca
        return a.brand.localeCompare(b.brand)
      })

    // ALTERNATIVA más intuitiva - descomentar para usar:
    // return sorted.sort((a, b) => a.brand.localeCompare(b.brand))

    case 'price-asc':
      // Precio de menor a mayor
      return sorted.sort((a, b) => a.price - b.price)

    case 'price-desc':
      // Precio de mayor a menor
      return sorted.sort((a, b) => b.price - a.price)

    default:
      return sorted
  }
})

// Índices para paginación
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage, sortedProducts.value.length)
)

// Productos paginados
const sortedAndPaginatedProducts = computed(() => {
  return sortedProducts.value.slice(startIndex.value, endIndex.value)
})

// Total de páginas
const totalPages = computed(() => {
  return Math.ceil(sortedProducts.value.length / itemsPerPage)
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

// Manejar cambios en ordenamiento
const handleSortChange = (newSortBy) => {
  sortBy.value = newSortBy
  resetPage() // Resetear a página 1 cuando cambia el ordenamiento
}

// Verificar si hay filtros activos o ordenamiento no por defecto
const hasActiveFilters = computed(() => {
  return activeFiltersCount.value > 0 || sortBy.value !== 'newest'
})

// Resetear todos los filtros y ordenamiento
const resetAllFilters = () => {
  // Resetear filtros
  activeFilters.value = {
    categories: [],
    brands: [],
    stock: [],
    priceRange: { min: null, max: null },
  }

  // Resetear ordenamiento
  sortBy.value = 'newest'

  // Resetear página
  resetPage()
}
</script>
