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
          <router-link to="/shop" class="continue-shopping-btn"> Ir a la tienda </router-link>
        </div>

        <!-- Carrito con productos -->
        <div v-else class="cart-content">
          <div class="cart-items">
            <div v-for="item in cartStore.cartItems" :key="item.cartItemId" class="cart-item">
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
                    aria-label="Disminuir cantidad de {{ item.name }}"
                    :aria-describedby="`quantity-${item.cartItemId}`"
                  >
                    −
                  </button>
                  <span
                    class="quantity"
                    :id="`quantity-${item.cartItemId}`"
                    role="status"
                    aria-live="polite"
                    :aria-label="`Cantidad: ${item.quantity}`"
                  >
                    {{ item.quantity }}
                  </span>
                  <button
                    class="quantity-btn plus"
                    @click="cartStore.updateQuantity(item.cartItemId, item.quantity + 1)"
                    aria-label="Aumentar cantidad de {{ item.name }}"
                    :aria-describedby="`quantity-${item.cartItemId}`"
                    :disabled="isMaxQuantity(item.quantity)"
                  >
                    +
                  </button>
                </div>
                <div class="item-total" aria-label="Subtotal del producto">
                  €{{ (item.price * item.quantity).toFixed(2) }}
                </div>
                <button
                  class="remove-item"
                  @click="confirmRemoveItem(item)"
                  :aria-label="`Eliminar ${item.name} del carrito`"
                >
                  Eliminar producto
                </button>
              </div>
            </div>

            <!-- Botón limpiar carrito (si hay productos) -->
            <div v-if="cartStore.totalItems > 0" class="cart-actions">
              <button class="clear-cart-btn" @click="confirmClearCart">Vaciar carrito</button>
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

              <hr />

              <div class="summary-row total">
                <span>Total</span>
                <span>€{{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>

              <button
                class="checkout-btn"
                @click="handleCheckout"
                :disabled="cartStore.loading || cartStore.totalItems === 0"
              >
                <span v-if="cartStore.loading">Procesando...</span>
                <span v-else>Proceder al pago</span>
              </button>

              <router-link to="/shop" class="continue-shopping"> Continuar comprando </router-link>

              <!-- Mensaje de error si hay problemas con Stripe -->
              <div v-if="cartStore.error" class="checkout-error">⚠️ {{ cartStore.error }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />

    <!-- Modal de confirmación para vaciar carrito -->
    <ConfirmModal
      :show="showConfirmModal"
      title="Vaciar carrito"
      message="¿Estás seguro de que quieres eliminar todos los productos del carrito? Esta acción no se puede deshacer."
      confirm-text="Sí, vaciar carrito"
      cancel-text="Cancelar"
      @confirm="handleConfirmClear"
      @cancel="handleCancelClear"
    />

    <!-- Modal de confirmación para eliminar producto individual -->
    <ConfirmModal
      :show="showRemoveItemModal"
      title="Eliminar producto"
      :message="`¿Estás seguro de que quieres eliminar '${itemToRemove?.name}' del carrito?`"
      confirm-text="Sí, eliminar"
      cancel-text="Cancelar"
      @confirm="handleConfirmRemoveItem"
      @cancel="handleCancelRemoveItem"
    />
  </div>
</template>

<script setup>
import { usePageMeta } from '@/composables/usePageMeta'
import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import ConfirmModal from '../components/ConfirmModal_comp.vue'
import { useCartStore } from '../stores/cartStore'
import { QUANTITY_LIMITS } from '@/utils/helpers'
import { ref, computed } from 'vue'

// SEO Meta Tags - No indexar carrito
usePageMeta({
  title: 'Carrito de Compras | Hackeed',
  description: 'Revisa tu carrito de compras en Hackeed',
  robots: 'noindex, nofollow', // No queremos que se indexe el carrito
  url: 'https://hackeed.com/cart',
})

const cartStore = useCartStore()
const showConfirmModal = ref(false)
const showRemoveItemModal = ref(false)
const itemToRemove = ref(null)

// Función para verificar si se alcanzó el máximo en un item
const isMaxQuantity = (quantity) => quantity >= QUANTITY_LIMITS.MAX

const confirmClearCart = () => {
  showConfirmModal.value = true
}

const handleConfirmClear = () => {
  cartStore.clearCart()
  showConfirmModal.value = false
}

const handleCancelClear = () => {
  showConfirmModal.value = false
}

const confirmRemoveItem = (item) => {
  itemToRemove.value = item
  showRemoveItemModal.value = true
}

const handleConfirmRemoveItem = () => {
  if (itemToRemove.value) {
    cartStore.removeFromCart(itemToRemove.value.cartItemId)
  }
  showRemoveItemModal.value = false
  itemToRemove.value = null
}

const handleCancelRemoveItem = () => {
  showRemoveItemModal.value = false
  itemToRemove.value = null
}

// ==========================================
// CHECKOUT - Redirección a Stripe
// ==========================================
const handleCheckout = async () => {
  try {
    // Verificar que hay items en el carrito
    if (cartStore.totalItems === 0) {
      console.warn('⚠️ Intento de checkout con carrito vacío')
      return
    }

    console.log('🛒 Iniciando proceso de checkout...')
    console.log('📦 Items en carrito:', cartStore.totalItems)
    console.log('💰 Total:', cartStore.totalPrice)

    // Información de cliente temporal (en producción esto vendría de un formulario)
    const customerInfo = {
      email: 'test@example.com', // TODO: Reemplazar con formulario de checkout
      name: 'Cliente de Prueba',
    }

    // Redirigir a Stripe Checkout
    await cartStore.redirectToCheckout(customerInfo)

    console.log('✅ Redirigiendo a Stripe...')
  } catch (error) {
    console.error('❌ Error en checkout:', error)
    // El error ya se muestra en cartStore.error automáticamente
  }
}
</script>
