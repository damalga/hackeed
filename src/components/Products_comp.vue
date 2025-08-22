<template>
  <section class="products">
    <div class="products-container">
      <h2 v-if="showTitle" class="products-title">{{ title }}</h2>
      <div class="products-grid">
        <div 
          v-for="product in displayedProducts" 
          :key="product.id" 
          class="product-card"
        >
          <div class="product-image" @click="openProductModal(product)">
            <img :src="product.img" :alt="product.name" />
          </div>
          
          <div class="product-info">
            <h3 class="product-name" @click="openProductModal(product)">{{ product.name }}</h3>
            <p class="product-desc">{{ product.desc }}</p>
            <div class="product-price">€{{ product.price }}</div>
            
            <!-- Stock badge (solo en shop) -->
            <div v-if="showStock" class="product-stock">
              <span v-if="product.inStock" class="stock-badge in-stock">En stock</span>
              <span v-else class="stock-badge out-of-stock">Agotado</span>
            </div>
            
            <!-- Controles del carrito (solo en shop) -->
            <div v-if="showCartControls" class="product-cart-controls">
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
                class="product-add-cart"
                @click="addToCart(product)"
                :disabled="!product.inStock"
              >
                {{ product.inStock ? 'Añadir al carrito' : 'Agotado' }}
              </button>
            </div>
            
            <!-- Botón simple (solo en home) -->
            <button v-else class="product-cta" @click="openProductModal(product)">Ver producto</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useProductModalStore } from '@/stores/productModalStore'
import { useCartStore } from '@/stores/cartStore'
import products from '@/data/products_data.js'

// Props configurables
const props = defineProps({
  title: {
    type: String,
    default: 'Productos destacados'
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  limit: {
    type: Number,
    default: null // null = mostrar todos
  },
  productsList: {
    type: Array,
    default: () => products // por defecto usa todos los productos
  },
  showStock: {
    type: Boolean,
    default: false // mostrar badges de stock
  },
  showCartControls: {
    type: Boolean,
    default: false // mostrar controles de carrito
  }
})

const productModalStore = useProductModalStore()
const cartStore = useCartStore()

// Productos a mostrar según configuración
const displayedProducts = computed(() => {
  const productsToShow = props.productsList
  
  if (props.limit && props.limit > 0) {
    return productsToShow.slice(0, props.limit)
  }
  
  return productsToShow
})

const openProductModal = (product) => {
  productModalStore.openModal(product)
}

const addToCart = (product) => {
  if (product.inStock) {
    cartStore.addToCart(product)
  }
}
</script>

<style scoped>
/* Estilos incluidos desde _products.scss */
</style>