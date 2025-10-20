<template>
  <div class="cart-page">
    <!-- Cart Header -->
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

    <!-- Cart Content -->
    <div class="cart-content">
      <!-- Empty Cart -->
      <div v-if="cart.items.length === 0" class="empty-cart">
        <i class="fas fa-shopping-cart empty-icon"></i>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega algunos productos para empezar a comprar</p>

        <!-- Test Products Button -->
        <button @click="addTestProducts" class="test-products-btn">
          <i class="fas fa-plus"></i>
          Agregar Productos de Prueba
        </button>

        <router-link to="/shop" class="continue-shopping-btn">
          <i class="fas fa-arrow-left"></i>
          Continuar Comprando
        </router-link>
      </div>

      <!-- Cart Items -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cart.items" :key="item.id" class="cart-item">
            <!-- Product Image -->
            <div class="item-image">
              <img
                :src="item.image || '/placeholder-product.jpg'"
                :alt="item.name"
                @error="handleImageError"
              />
            </div>

            <!-- Product Info -->
            <div class="item-info">
              <h4 class="item-name">{{ item.name }}</h4>
              <p class="item-sku">SKU: {{ item.sku }}</p>
              <div class="item-price">
                <span class="unit-price">{{ formatPrice(item.price) }}</span>
                <span class="multiply">×</span>
                <span class="quantity">{{ item.quantity }}</span>
              </div>
            </div>

            <!-- Item Controls -->
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
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>{{ formatPrice(cart.total) }}</span>
          </div>
          <div class="summary-row">
            <span>Envío:</span>
            <span>{{ formatPrice(shippingCost) }}</span>
          </div>
          <div class="summary-row">
            <span>IVA (21%):</span>
            <span>{{ formatPrice(taxAmount) }}</span>
          </div>
          <hr />
          <div class="summary-row total">
            <span>Total:</span>
            <span>{{ formatPrice(totalWithTaxAndShipping) }}</span>
          </div>

          <button
            @click="proceedToCheckout"
            :disabled="loading || cart.items.length === 0"
            class="checkout-btn"
          >
            <i class="fas fa-credit-card"></i>
            <span v-if="loading">Procesando...</span>
            <span v-else>Pago Rápido (Test)</span>
          </button>

          <router-link to="/shop" class="continue-shopping">
            <i class="fas fa-arrow-left"></i>
            Continuar Comprando
          </router-link>
        </div>
      </div>
    </div>

    <!-- Customer Information Modal -->
    <div v-if="showCheckoutModal" class="stripe-checkout">
      <div class="checkout-modal-overlay" @click="closeModal">
        <div class="checkout-modal" @click.stop>
          <div class="modal-header">
            <h3>Información de Contacto</h3>
            <button @click="closeModal" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleCheckout" class="customer-form">
            <div class="form-group">
              <label for="email">Email *</label>
              <input
                type="email"
                id="email"
                v-model="customerInfo.email"
                required
                :disabled="loading"
                placeholder="tu@email.com"
              />
            </div>

            <div class="form-group">
              <label for="name">Nombre completo *</label>
              <input
                type="text"
                id="name"
                v-model="customerInfo.name"
                required
                :disabled="loading"
                placeholder="Tu nombre completo"
              />
            </div>

            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                v-model="customerInfo.phone"
                :disabled="loading"
                placeholder="+34 600 000 000"
              />
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" :disabled="loading" class="cancel-btn">
                Cancelar
              </button>
              <button type="submit" :disabled="loading || !isFormValid" class="submit-btn">
                <i class="fas fa-lock"></i>
                <span v-if="loading">Procesando...</span>
                <span v-else>Pagar con Stripe</span>
              </button>
            </div>
          </form>
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

    <!-- Success Message -->
    <div v-if="successMessage" class="stripe-message success">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStripe } from '@/composables/useStripe'

export default {
  name: 'ShoppingCart',
  setup() {
    const {
      loading,
      error,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartItemCount,
      formatPrice,
      redirectToCheckout,
      saveCartToStorage,
      loadCartFromStorage,
    } = useStripe()

    // Modal state
    const showCheckoutModal = ref(false)
    const successMessage = ref('')

    // Customer information
    const customerInfo = ref({
      email: '',
      name: '',
      phone: '',
    })

    // Calculated values
    const shippingCost = computed(() => {
      // Envío gratuito para compras > 50€
      return cart.total >= 50 ? 0 : 5.99
    })

    const taxAmount = computed(() => {
      // IVA del 21%
      return cart.total * 0.21
    })

    const totalWithTaxAndShipping = computed(() => {
      return cart.total + shippingCost.value + taxAmount.value
    })

    const isFormValid = computed(() => {
      return customerInfo.value.email.trim() !== '' && customerInfo.value.name.trim() !== ''
    })

    // Methods
    const proceedToCheckout = () => {
      console.log('Cart: Proceed to checkout clicked')
      console.log('Cart: Items:', cart.items)

      if (cart.items.length === 0) {
        error.value = 'El carrito está vacío'
        return
      }

      // Por ahora, vamos directo al checkout sin modal
      handleQuickCheckout()
    }

    const handleQuickCheckout = async () => {
      try {
        console.log('Cart: Starting quick checkout')
        loading.value = true

        // Usar un email temporal para testing
        const tempCustomerInfo = {
          email: 'test@example.com',
          name: 'Cliente de Prueba',
          phone: '',
        }

        await redirectToCheckout(tempCustomerInfo)
      } catch (err) {
        console.error('Cart: Quick checkout error:', err)
      } finally {
        loading.value = false
      }
    }

    const addTestProducts = () => {
      console.log('Cart: Adding test products')

      // Productos de prueba
      const testProducts = [
        {
          id: 1,
          sku: 'TEST-001',
          name: 'Producto de Prueba 1',
          price: 29.99,
          image_url: 'https://via.placeholder.com/150x150?text=Producto+1',
        },
        {
          id: 2,
          sku: 'TEST-002',
          name: 'Producto de Prueba 2',
          price: 49.99,
          image_url: 'https://via.placeholder.com/150x150?text=Producto+2',
        },
      ]

      testProducts.forEach((product) => {
        addToCart(product, 1)
      })

      successMessage.value = 'Productos de prueba agregados al carrito'
    }

    const closeModal = () => {
      showCheckoutModal.value = false
      customerInfo.value = {
        email: '',
        name: '',
        phone: '',
      }
    }

    const handleCheckout = async () => {
      try {
        console.log('Cart: Sending to Stripe with customer data:', customerInfo.value)
        await redirectToCheckout(customerInfo.value)
        successMessage.value = 'Redirigiendo a Stripe...'
        showCheckoutModal.value = false
      } catch (err) {
        console.error('Cart: Checkout error:', err)
        // El error ya se maneja en useStripe
      }
    }

    const handleQuantityInput = (productId, event) => {
      const newQuantity = parseInt(event.target.value) || 1
      if (newQuantity > 0 && newQuantity <= 99) {
        updateCartQuantity(productId, newQuantity)
      }
    }

    const handleImageError = (event) => {
      event.target.src = '/placeholder-product.jpg'
    }

    // Watch for cart changes to save to localStorage
    watch(
      () => cart,
      () => {
        saveCartToStorage()
      },
      { deep: true }
    )

    // Clear success message after 3 seconds
    watch(successMessage, (newValue) => {
      if (newValue) {
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      }
    })

    // Load cart on mount
    onMounted(() => {
      loadCartFromStorage()
    })

    return {
      loading,
      error,
      cart,
      showCheckoutModal,
      customerInfo,
      successMessage,
      shippingCost,
      taxAmount,
      totalWithTaxAndShipping,
      isFormValid,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartItemCount,
      formatPrice,
      proceedToCheckout,
      closeModal,
      handleCheckout,
      handleQuickCheckout,
      handleQuantityInput,
      handleImageError,
      addTestProducts,
    }
  },
}
</script>
