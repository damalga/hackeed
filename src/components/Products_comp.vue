<template>
  <section class="products">
    <div class="products-container">
      <h2 class="products-title">Productos destacados</h2>
      <div class="products-grid">
        <div 
          v-for="product in featuredProducts" 
          :key="product.id" 
          class="product-card"
          @click="openProductModal(product)"
        >
          <div class="product-image">
            <img :src="product.img" :alt="product.name" />
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-desc">{{ product.desc }}</p>
            <div class="product-price">€{{ product.price }}</div>
            <button class="product-cta">Ver producto</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useProductModalStore } from '@/stores/productModalStore'
import products from '@/data/products_data.js'

const productModalStore = useProductModalStore()

// Mostrar solo los 3 productos más populares (primeros 3)
const featuredProducts = computed(() => {
  return products.slice(0, 3)
})

const openProductModal = (product) => {
  productModalStore.openModal(product)
}
</script>

<style scoped>
/* Estilos incluidos desde _products.scss */
</style>