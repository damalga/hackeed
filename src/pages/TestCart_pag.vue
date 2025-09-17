<template>
  <div class="stripe-page light-bg">
    <div class="stripe-container">
      <h1>🛒 Test del Carrito de Compras</h1>
      <p>Esta página es para testear la funcionalidad del carrito y Stripe</p>

      <!-- Estado del Sistema -->
      <div class="stripe-section">
        <h2>📊 Estado del Sistema</h2>
        <div class="config-grid">
          <div class="status-item">
            <strong>Stripe:</strong>
            <span :class="stripeStatus.class">{{ stripeStatus.text }}</span>
          </div>
          <div class="status-item">
            <strong>Carrito:</strong>
            <span>{{ getCartItemCount() }} items</span>
          </div>
          <div class="status-item">
            <strong>Total:</strong>
            <span>{{ formatPrice(cart.total) }}</span>
          </div>
          <div class="status-item">
            <strong>Loading:</strong>
            <span :class="loading ? 'error' : 'success'">{{ loading ? 'Sí' : 'No' }}</span>
          </div>
        </div>

        <!-- Errores -->
        <div v-if="error" class="error-display">
          <h3>❌ Error:</h3>
          <pre>{{ error }}</pre>
        </div>
      </div>

      <!-- Controles de Prueba -->
      <div class="stripe-section">
        <h2>🎮 Controles de Prueba</h2>
        <div class="test-controls">
          <button @click="addTestProducts" class="test-btn primary">
            <i class="fas fa-plus"></i>
            Agregar Productos de Prueba
          </button>

          <button @click="clearCart" class="test-btn danger" :disabled="cart.items.length === 0">
            <i class="fas fa-trash"></i>
            Limpiar Carrito
          </button>

          <button @click="testStripeConnection" class="test-btn info" :disabled="loading">
            <i class="fas fa-plug"></i>
            Test Conexión Stripe
          </button>

          <button @click="debugCart" class="test-btn secondary">
            <i class="fas fa-bug"></i>
            Debug Carrito
          </button>
        </div>
      </div>

      <!-- Vista del Carrito -->
      <div class="stripe-section">
        <h2>🛍️ Contenido del Carrito</h2>
        <div v-if="cart.items.length === 0" class="empty-cart">
          <p>El carrito está vacío. Usa el botón "Agregar Productos de Prueba" para empezar.</p>
        </div>
        <div v-else class="stripe-cart">
          <div class="cart-items">
            <div v-for="item in cart.items" :key="item.id" class="cart-item">
              <img :src="item.image || '/placeholder.jpg'" :alt="item.name" class="item-image" />
              <div class="item-details">
                <h3>{{ item.name }}</h3>
                <p><strong>SKU:</strong> {{ item.sku }}</p>
                <p><strong>Precio:</strong> {{ formatPrice(item.price) }}</p>
                <p><strong>Cantidad:</strong> {{ item.quantity }}</p>
                <p><strong>Total:</strong> {{ formatPrice(item.total) }}</p>
              </div>
              <div class="item-controls">
                <button
                  @click="updateCartQuantity(item.id, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="updateCartQuantity(item.id, item.quantity + 1)">
                  <i class="fas fa-plus"></i>
                </button>
                <button @click="removeFromCart(item.id)" class="remove-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área de Checkout -->
      <div v-if="cart.items.length > 0" class="stripe-section">
        <h2>💳 Área de Checkout</h2>
        <div class="checkout-summary">
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>{{ formatPrice(cart.total) }}</span>
          </div>
          <div class="summary-line">
            <span>IVA (21%):</span>
            <span>{{ formatPrice(cart.total * 0.21) }}</span>
          </div>
          <div class="summary-line">
            <span>Envío:</span>
            <span>{{ formatPrice(cart.total >= 50 ? 0 : 5.99) }}</span>
          </div>
          <div class="summary-line total">
            <span><strong>Total:</strong></span>
            <span
              ><strong>{{
                formatPrice(cart.total + cart.total * 0.21 + (cart.total >= 50 ? 0 : 5.99))
              }}</strong></span
            >
          </div>
        </div>

        <!-- Formulario de Cliente -->
        <div class="customer-form">
          <h3>Información del Cliente</h3>
          <div class="form-group">
            <label>Email:</label>
            <input v-model="testCustomer.email" type="email" placeholder="test@example.com" />
          </div>
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="testCustomer.name" type="text" placeholder="Cliente de Prueba" />
          </div>
          <div class="form-group">
            <label>Teléfono:</label>
            <input v-model="testCustomer.phone" type="tel" placeholder="+34 600 000 000" />
          </div>
        </div>

        <!-- Botones de Checkout -->
        <div class="checkout-buttons">
          <button @click="testQuickCheckout" :disabled="loading" class="checkout-btn primary">
            <i class="fas fa-credit-card"></i>
            <span v-if="loading">Procesando...</span>
            <span v-else>Checkout Rápido (Test)</span>
          </button>

          <button
            @click="testWithCustomerInfo"
            :disabled="loading || !testCustomer.email"
            class="checkout-btn secondary"
          >
            <i class="fas fa-user"></i>
            <span v-if="loading">Procesando...</span>
            <span v-else>Checkout con Datos</span>
          </button>
        </div>
      </div>

      <!-- Log de Debug -->
      <div class="stripe-section">
        <h2>📝 Log de Debug</h2>
        <button @click="clearLog" class="clear-log-btn">
          <i class="fas fa-broom"></i>
          Limpiar Log
        </button>
        <div class="log-content">
          <div v-for="(log, index) in debugLogs" :key="index" class="log-entry" :class="log.type">
            <span class="timestamp">{{ log.timestamp }}</span>
            <span class="message">{{ log.message }}</span>
          </div>
          <div v-if="debugLogs.length === 0" class="no-logs">
            No hay logs aún. Usa los controles de prueba para generar actividad.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStripe } from '@/composables/useStripe'

export default {
  name: 'TestCart',
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
      initStripe,
    } = useStripe()

    // Estado local
    const debugLogs = ref([])
    const stripeStatus = ref({ text: 'No inicializado', class: 'warning' })
    const testCustomer = ref({
      email: 'test@example.com',
      name: 'Cliente de Prueba',
      phone: '+34 600 000 000',
    })

    // Métodos de utilidad
    const addLog = (message, type = 'info') => {
      debugLogs.value.push({
        timestamp: new Date().toLocaleTimeString(),
        message,
        type,
      })
    }

    const clearLog = () => {
      debugLogs.value = []
      addLog('Log limpiado', 'info')
    }

    // Métodos de prueba
    const addTestProducts = () => {
      const products = [
        {
          id: '21b7de1e-cb06-4c1b-a558-330450f934e6', // Flipper Zero
          sku: 'FZ-001',
          name: 'Flipper Zero',
          price: 245.0,
          image_url: 'images/flipper_zero/webp/flipper_zero_1.webp',
        },
        {
          id: '05692200-9481-47e4-9285-539808f19917', // Expansión WiFi Flipper Zero
          sku: 'FZ-WIFI',
          name: 'Expansión WiFi Flipper Zero',
          price: 45.0,
          image_url: 'images/flipper_zero/webp/flipper_zero_wifi_1.webp',
        },
      ]

      products.forEach((product) => {
        addToCart(product, 1)
      })

      addLog(`Agregados ${products.length} productos de prueba`, 'success')
    }

    const testStripeConnection = async () => {
      try {
        addLog('Probando conexión con Stripe...', 'info')
        const stripe = await initStripe()

        if (stripe) {
          stripeStatus.value = { text: 'Conectado', class: 'success' }
          addLog('✅ Conexión con Stripe exitosa', 'success')
        } else {
          throw new Error('No se pudo inicializar Stripe')
        }
      } catch (err) {
        stripeStatus.value = { text: 'Error', class: 'error' }
        addLog(`❌ Error de conexión: ${err.message}`, 'error')
      }
    }

    const debugCart = () => {
      addLog('=== DEBUG CARRITO ===', 'info')
      addLog(`Items en carrito: ${cart.items.length}`, 'info')
      addLog(`Total: ${formatPrice(cart.total)}`, 'info')

      cart.items.forEach((item, index) => {
        addLog(
          `Item ${index + 1}: ${item.name} x${item.quantity} = ${formatPrice(item.total)}`,
          'info'
        )
      })

      addLog('Estado guardado en localStorage:', 'info')
      const savedCart = localStorage.getItem('hackeed_cart')
      addLog(savedCart || 'No hay carrito guardado', 'info')
    }

    const testQuickCheckout = async () => {
      try {
        addLog('Iniciando checkout rápido...', 'info')
        await redirectToCheckout({
          email: 'test@example.com',
          name: 'Cliente de Prueba',
        })
        addLog('Redirigiendo a Stripe...', 'success')
      } catch (err) {
        addLog(`❌ Error en checkout: ${err.message}`, 'error')
      }
    }

    const testWithCustomerInfo = async () => {
      try {
        addLog('Iniciando checkout con datos del cliente...', 'info')
        addLog(`Email: ${testCustomer.value.email}`, 'info')
        addLog(`Nombre: ${testCustomer.value.name}`, 'info')

        await redirectToCheckout(testCustomer.value)
        addLog('Redirigiendo a Stripe...', 'success')
      } catch (err) {
        addLog(`❌ Error en checkout: ${err.message}`, 'error')
      }
    }

    // Lifecycle
    onMounted(() => {
      addLog('Página de test cargada', 'success')
      testStripeConnection()
    })

    return {
      // Stripe composable
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

      // Estado local
      debugLogs,
      stripeStatus,
      testCustomer,

      // Métodos
      addLog,
      clearLog,
      addTestProducts,
      testStripeConnection,
      debugCart,
      testQuickCheckout,
      testWithCustomerInfo,
    }
  },
}
</script>
