<template>
  <div class="cart-page">
    <div class="cart-container">
      <h2 class="cart-title">
        <i class="fas fa-shopping-cart"></i>
        Carrito de Compras
        <span v-if="getCartItemCount() > 0" class="item-count">
          ({{ getCartItemCount() }} {{ getCartItemCount() === 1 ? 'item' : 'items' }})
        </span>
      </h2>
      <button
        v-if="cart.items.length > 0"
        @click="clearCart"
        class="clear-cart-btn"
        :disabled="loading"
      >
        <i class="fas fa-trash"></i>
        Vaciar Carrito
      </button>
    </div>

    <div class="cart-content">
      <!-- Empty Cart -->
      <div v-if="cart.items.length === 0" class="empty-cart">
        <i class="fas fa-shopping-cart empty-icon"></i>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega algunos productos para empezar a comprar</p>
        <router-link to="/shop" class="continue-shopping-btn">
          <i class="fas fa-arrow-left"></i>
          Continuar Comprando
        </router-link>
      </div>

      <!-- Cart Items -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cart.items" :key="item.id" class="cart-item">
            <div class="item-image">
              <img
                :src="item.image || '/placeholder-product.jpg'"
                :alt="item.name"
                @error="handleImageError"
              />
            </div>

            <div class="item-info">
              <h4 class="item-name">{{ item.name }}</h4>
              <p class="item-sku">SKU: {{ item.sku }}</p>
              <div class="item-price">
                <span class="unit-price">{{ formatPrice(item.price) }}</span>
                <span class="multiply">×</span>
                <span class="quantity">{{ item.quantity }}</span>
              </div>
            </div>

            <div class="item-controls">
              <div class="quantity-controls">
                <button
                  @click="updateCartQuantity(item.id, item.quantity - 1)"
                  :disabled="loading || item.quantity <= 1"
                  class="quantity-btn minus"
                >
                  -
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button
                  @click="updateCartQuantity(item.id, item.quantity + 1)"
                  :disabled="loading"
                  class="quantity-btn plus"
                >
                  +
                </button>
              </div>
              <div class="item-total">{{ formatPrice(item.total) }}</div>
              <button
                @click="removeFromCart(item.id)"
                :disabled="loading"
                class="remove-item"
                title="Eliminar producto"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div v-if="cart.items.length > 0" class="cart-summary">
        <div class="summary-card">
          <h3>Resumen del Pedido</h3>
          <div class="summary-row total">
            <span>Total:</span>
            <span>{{ formatPrice(cart.total) }}</span>
          </div>

          <router-link to="/shop" class="continue-shopping">
            <i class="fas fa-arrow-left"></i>
            Continuar Comprando
          </router-link>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="stripe-message error">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
      <button @click="error = null" class="close-error">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { onMounted, watch } from 'vue'
import { useStripe } from '@/composables/useStripe'

export default {
  name: 'ShoppingCart',
  setup() {
    const {
      loading,
      error,
      cart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartItemCount,
      formatPrice,
      saveCartToStorage,
      loadCartFromStorage,
    } = useStripe()

    const handleImageError = (event) => {
      event.target.src = '/placeholder-product.jpg'
    }

    watch(
      () => cart,
      () => {
        saveCartToStorage()
      },
      { deep: true }
    )

    onMounted(() => {
      loadCartFromStorage()
    })

    return {
      loading,
      error,
      cart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartItemCount,
      formatPrice,
      handleImageError,
    }
  },
}
</script>
