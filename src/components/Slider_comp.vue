<template>
  <section class="slider">
    <h2 class="slider-title-main">Novedades</h2>
    <div class="slider-container">
      <div
        class="slider-slide"
        v-for="(product, i) in limitedProducts"
        :key="product.id"
        :class="{ active: i === activeIndex }"
        v-show="i === activeIndex"
      >
        <img :src="product.img" :alt="product.name" class="slider-img" />
        <h3 class="slider-title">{{ product.name }}</h3>
        <p class="slider-desc">{{ product.desc }}</p>
        <button class="slider-cta" @click="openProductModal(product.id)">Ver Producto</button>
      </div>
      <button class="slider-arrow slider-arrow--left" @click="prevSlide">&#8592;</button>
      <button class="slider-arrow slider-arrow--right" @click="nextSlide">&#8594;</button>
    </div>
    <div class="slider-dots">
      <span
        v-for="(product, i) in limitedProducts"
        :key="product.id"
        :class="{ active: i === activeIndex }"
        @click="activeIndex = i"
      ></span>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProducts } from '@/composables/useProducts'
import { useProductModalStore } from '@/stores/productModalStore'

const productModalStore = useProductModalStore()
const { products, loadProducts } = useProducts()
const activeIndex = ref(0)

// Limit to last 3 products
const limitedProducts = computed(() => {
  return products.value.slice(-3)
})

onMounted(() => {
  loadProducts()
})

function nextSlide() {
  activeIndex.value = (activeIndex.value + 1) % limitedProducts.value.length
}

function prevSlide() {
  activeIndex.value =
    (activeIndex.value - 1 + limitedProducts.value.length) % limitedProducts.value.length
}

function openProductModal(productId) {
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    productModalStore.openModal(product)
  }
}
</script>
