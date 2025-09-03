<template>
  <div>
    <Header />

    <main class="cart-page">
      <div class="cart-container">
        <h1 class="cart-title">Tu Carrito</h1>

        <!-- Carrito vacío -->
        <div v-if="cartStore.totalItems === 0" class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>¡Añade algunos productos increíbles y vuelve aquí!</p>
          <router-link to="/shop" class="continue-shopping-btn">
            Ir a la tienda
          </router-link>
        </div>

        <!-- Carrito con productos -->
        <div v-else class="cart-content">
          <div class="cart-items">
            <div
              v-for="item in cartStore.cartItems"
              :key="item.cartItemId"
              class="cart-item"
            >
              <div class="item-image">
                <img :src="item.img" :alt="item.name" />
              </div>

              <div class="item-info">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-desc">{{ item.desc }}</p>
                <div class="item-price">€{{ item.price }}</div>
              </div>

              <div class="item-controls">
                <div class="quantity-controls">
                  <button
                    class="quantity-btn minus"
                    @click="cartStore.updateQuantity(item.cartItemId, item.quantity - 1)"
                  >
                    −
                  </button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button
                    class="quantity-btn plus"
                    @click="cartStore.updateQuantity(item.cartItemId, item.quantity + 1)"
                  >
                    +
                  </button>
                </div>
                <div class="item-total">€{{ (item.price * item.quantity).toFixed(2) }}</div>
                <button
                  class="remove-item"
                  @click="cartStore.removeFromCart(item.cartItemId)"
                  title="Eliminar producto"
                >
                  Eliminar producto
                </button>
              </div>
            </div>

            <!-- Botón limpiar carrito (si hay productos) -->
            <div v-if="cartStore.totalItems > 0" class="cart-actions">
              <button
                class="clear-cart-btn"
                @click="confirmClearCart"
              >
                Vaciar carrito
              </button>
            </div>
          </div>

          <!-- Resumen del carrito -->
          <div class="cart-summary">
            <div class="summary-card">
              <h3>Resumen del pedido</h3>

              <div class="summary-row">
                <span>Productos ({{ cartStore.totalItems }})</span>
                <span>€{{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>

              <div class="summary-row">
                <span>Envío</span>
                <span>Gratis</span>
              </div>

              <hr>

              <div class="summary-row total">
                <span>Total</span>
                <span>€{{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>

              <button class="checkout-btn">
                Proceder al pago
              </button>

              <router-link to="/shop" class="continue-shopping">
                Continuar comprando
              </router-link>
            </div>
          </div>
        </div>

      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import { useCartStore } from '../stores/cartStore'

const cartStore = useCartStore()

const confirmClearCart = () => {
  if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
    cartStore.clearCart()
  }
}
</script>

<style scoped>
/* Estilos incluidos desde _cart.scss */
</style>
