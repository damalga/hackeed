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
          
          <div class="shop-grid">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="shop-card"
            >
              <div class="shop-img-container" @click="openProductModal(product)">
                <img
                  :src="product.img"
                  :alt="product.name"
                  class="shop-img"
                />
              </div>
              <div class="shop-card-content">
                <h3 class="shop-product-title" @click="openProductModal(product)">
                  {{ product.name }}
                </h3>
                <p class="shop-product-desc">
                  {{ product.desc }}
                </p>
                <div class="shop-price">€{{ product.price }}</div>
                
                <!-- Stock badge -->
                <div class="shop-stock">
                  <span v-if="product.inStock" class="stock-badge in-stock">En stock</span>
                  <span v-else class="stock-badge out-of-stock">Agotado</span>
                </div>
                
                <!-- Controles del carrito -->
                <div class="shop-cart-controls">
                  <div v-if="cartStore.isInCart(product.id)" class="quantity-controls">
                    <button 
                      class="quantity-btn" 
                      @click="cartStore.updateQuantity(product.id, cartStore.getItemQuantity(product.id) - 1)"
                    >
                      −
                    </button>
                    <span class="quantity">{{ cartStore.getItemQuantity(product.id) }}</span>
                    <button 
                      class="quantity-btn" 
                      @click="cartStore.updateQuantity(product.id, cartStore.getItemQuantity(product.id) + 1)"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    v-else
                    class="shop-add-cart"
                    @click="addToCart(product)"
                    :disabled="!product.inStock"
                  >
                    {{ product.inStock ? 'Añadir al carrito' : 'Agotado' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
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
import { useCartStore } from '../stores/cartStore'
import { useProductModalStore } from '../stores/productModalStore'
import products from '../data/products_data.js'

import Header from "../components/Header_comp.vue"
import Footer from "../components/Footer_comp.vue"
import Filters from "../components/Filters_comp.vue"

const cartStore = useCartStore()
const productModalStore = useProductModalStore()

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

const addToCart = (product) => {
  if (product.inStock) {
    cartStore.addToCart(product)
  }
}

const openProductModal = (product) => {
  productModalStore.openModal(product)
}
</script>

<style scoped>
/* Estilos incluidos desde _shop.scss */
</style>