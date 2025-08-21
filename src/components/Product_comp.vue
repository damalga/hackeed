<template>
  <div v-if="productModalStore.isModalOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="closeModal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <div v-if="product" class="modal-body">
        <!-- Galería de imágenes -->
        <div class="modal-images">
          <div class="main-image">
            <img :src="selectedImage" :alt="product.name" />
          </div>
          <div v-if="product.images && product.images.length > 1" class="image-thumbnails">
            <button 
              v-for="(image, index) in product.images" 
              :key="index"
              class="thumbnail"
              :class="{ active: selectedImage === image }"
              @click="selectedImage = image"
            >
              <img :src="image" :alt="`${product.name} - imagen ${index + 1}`" />
            </button>
          </div>
        </div>

        <!-- Información del producto -->
        <div class="modal-info">
          <div class="product-header">
            <h2 class="product-title">{{ product.name }}</h2>
            <span class="product-category">{{ product.category }}</span>
          </div>

          <div class="product-price">
            <span class="price">€{{ product.price }}</span>
            <span v-if="product.inStock" class="stock in-stock">En stock</span>
            <span v-else class="stock out-of-stock">Agotado</span>
          </div>

          <p class="product-description">{{ product.longDesc || product.desc }}</p>

          <!-- Características -->
          <div v-if="product.features && product.features.length" class="product-features">
            <h3>Características principales:</h3>
            <ul>
              <li v-for="feature in product.features" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>

          <!-- Controles del carrito -->
          <div class="cart-controls">
            <div v-if="cartStore.isInCart(product.id)" class="quantity-controls">
              <button 
                class="quantity-btn" 
                @click="updateQuantity(cartStore.getItemQuantity(product.id) - 1)"
              >
                -
              </button>
              <span class="quantity">{{ cartStore.getItemQuantity(product.id) }}</span>
              <button 
                class="quantity-btn" 
                @click="updateQuantity(cartStore.getItemQuantity(product.id) + 1)"
              >
                +
              </button>
              <button class="remove-btn" @click="cartStore.removeFromCart(product.id)">
                Quitar del carrito
              </button>
            </div>
            <button 
              v-else
              class="add-to-cart-btn" 
              @click="addToCart"
              :disabled="!product.inStock"
            >
              {{ product.inStock ? 'Añadir al carrito' : 'Agotado' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProductModalStore } from '@/stores/productModalStore'
import { useCartStore } from '@/stores/cartStore'

const productModalStore = useProductModalStore()
const cartStore = useCartStore()

const selectedImage = ref('')

const product = computed(() => productModalStore.selectedProduct)

// Actualizar imagen seleccionada cuando cambie el producto
watch(product, (newProduct) => {
  if (newProduct && newProduct.images && newProduct.images.length > 0) {
    selectedImage.value = newProduct.images[0]
  } else if (newProduct && newProduct.img) {
    selectedImage.value = newProduct.img
  }
}, { immediate: true })

const closeModal = () => {
  productModalStore.closeModal()
}

const addToCart = () => {
  if (product.value && product.value.inStock) {
    cartStore.addToCart(product.value)
  }
}

const updateQuantity = (newQuantity) => {
  if (product.value) {
    cartStore.updateQuantity(product.value.id, newQuantity)
  }
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && productModalStore.isModalOpen) {
    closeModal()
  }
})
</script>

<style scoped>
/* Estilos incluidos desde _product.scss */
</style>