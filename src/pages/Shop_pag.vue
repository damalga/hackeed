<template>
  <div>
    <Header />
    <section class="shop-section">
      <h2 class="shop-title">
        Productos top hacker
      </h2>
      <div class="shop-grid">
        <div
          v-for="product in products"
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
          <div class="shop-content">
            <h3 class="shop-product-title" @click="openProductModal(product)">
              {{ product.name }}
            </h3>
            <p class="shop-product-desc">
              {{ product.desc }}
            </p>
            <div class="shop-price">€{{ product.price }}</div>
            
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
    </section>
    <Footer />
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cartStore'
import { useProductModalStore } from '../stores/productModalStore'
import products from '../data/products_data.js'

import Header from "../components/Header_comp.vue";
import Footer from "../components/Footer_comp.vue";

const cartStore = useCartStore()
const productModalStore = useProductModalStore()

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