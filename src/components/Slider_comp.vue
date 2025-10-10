<template>
  <section class="slider" aria-label="Carrusel de novedades">
    <h2 class="slider-title-main">Novedades</h2>
    <div class="slider-container" role="region" aria-roledescription="carrusel">
      <div
        class="slider-slide"
        v-for="(product, i) in limitedProducts"
        :key="product.id"
        :class="{ active: i === activeIndex }"
        v-show="i === activeIndex"
        role="group"
        :aria-roledescription="'diapositiva'"
        :aria-label="`${i + 1} de ${limitedProducts.length}`"
      >
        <img
          :src="product.img"
          :alt="`${product.name} - imagen promocional`"
          class="slider-img"
        />
        <h3 class="slider-title">{{ product.name }}</h3>
        <p class="slider-desc">{{ product.desc }}</p>
        <button
          class="slider-cta"
          @click="openProductModal(product.id)"
          :aria-label="`Ver detalles de ${product.name}`"
        >
          Ver Producto
        </button>
      </div>
      <button
        class="slider-arrow slider-arrow--left"
        @click="prevSlide"
        aria-label="Ir a la diapositiva anterior"
      >
        &#8592;
      </button>
      <button
        class="slider-arrow slider-arrow--right"
        @click="nextSlide"
        aria-label="Ir a la siguiente diapositiva"
      >
        &#8594;
      </button>
    </div>
    <div class="slider-dots" role="tablist" aria-label="Controles de navegación del carrusel">
      <button
        v-for="(product, i) in limitedProducts"
        :key="product.id"
        :class="{ active: i === activeIndex }"
        @click="goToSlide(i)"
        role="tab"
        :aria-label="`Ir a la diapositiva ${i + 1}: ${product.name}`"
        :aria-selected="i === activeIndex ? 'true' : 'false'"
        :tabindex="i === activeIndex ? 0 : -1"
      ></button>
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
  return products.value.slice(-4)
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

function goToSlide(index) {
  activeIndex.value = index
}

function openProductModal(productId) {
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    productModalStore.openModal(product)
  }
}
</script>
