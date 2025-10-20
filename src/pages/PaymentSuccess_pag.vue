<template>
  <div class="payment-success">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <h2>Verificando tu pago...</h2>
      <p>Por favor espera mientras confirmamos tu transacción</p>
    </div>

    <!-- Success State -->
    <div v-else-if="paymentVerified" class="success-container">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>

      <h1 class="success-title">¡Pago Exitoso!</h1>
      <p class="success-subtitle">Tu pedido ha sido procesado correctamente</p>

      <!-- Order Details -->
      <div v-if="orderDetails" class="order-summary">
        <h3>Detalles de tu Pedido</h3>

        <div class="order-info">
          <div class="info-row">
            <span class="label">Número de Pedido:</span>
            <span class="value">{{ orderDetails.order_number }}</span>
          </div>
          <div class="info-row">
            <span class="label">Total Pagado:</span>
            <span class="value">{{
              formatPrice(orderDetails.total_amount, orderDetails.currency)
            }}</span>
          </div>
          <div class="info-row">
            <span class="label">Estado:</span>
            <span class="value status" :class="orderDetails.status">
              {{ getStatusText(orderDetails.status) }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ orderDetails.customer_email }}</span>
          </div>
          <div class="info-row">
            <span class="label">Fecha:</span>
            <span class="value">{{ formatDate(orderDetails.created_at) }}</span>
          </div>
        </div>

        <!-- Order Items -->
        <div v-if="orderDetails.items && orderDetails.items.length > 0" class="order-items">
          <h4>Productos</h4>
          <div class="items-list">
            <div v-for="item in orderDetails.items" :key="item.id" class="order-item">
              <div class="item-info">
                <h5>{{ item.product_name }}</h5>
                <p class="item-sku">SKU: {{ item.product_sku }}</p>
              </div>
              <div class="item-quantity">
                {{ item.quantity }} {{ item.quantity === 1 ? 'unidad' : 'unidades' }}
              </div>
              <div class="item-price">
                {{ formatPrice(item.total_price, orderDetails.currency) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="stripe-section">
        <h3>¿Qué sigue?</h3>
        <div class="steps-list">
          <div class="step">
            <i class="fas fa-envelope"></i>
            <div>
              <h4>Confirmación por Email</h4>
              <p>Te hemos enviado un email de confirmación con todos los detalles</p>
            </div>
          </div>
          <div class="step">
            <i class="fas fa-box"></i>
            <div>
              <h4>Preparación del Pedido</h4>
              <p>Comenzaremos a preparar tu pedido en las próximas 24 horas</p>
            </div>
          </div>
          <div class="step">
            <i class="fas fa-truck"></i>
            <div>
              <h4>Envío</h4>
              <p>Te notificaremos cuando tu pedido esté en camino</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <router-link to="/shop" class="test-btn">
          <i class="fas fa-shopping-bag"></i>
          Continuar Comprando
        </router-link>
        <button @click="downloadInvoice" class="test-btn secondary" v-if="canDownloadInvoice">
          <i class="fas fa-download"></i>
          Descargar Factura
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="stripe-container">
      <div class="stripe-error">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>

        <h1 class="error-title">Problema con el Pago</h1>
        <p class="error-subtitle">
          {{ errorMessage || 'No pudimos verificar tu pago. Por favor contacta con nosotros.' }}
        </p>

        <div class="actions">
          <router-link to="/cart" class="test-btn">
            <i class="fas fa-redo"></i>
            Intentar Nuevamente
          </router-link>
          <a href="mailto:soporte@hackeed.com" class="test-btn secondary">
            <i class="fas fa-envelope"></i>
            Contactar Soporte
          </a>
        </div>

        <!-- Session Details for Debugging -->
        <div v-if="sessionId && $route.query.debug" class="stripe-section">
          <h4>Información de Debug</h4>
          <p><strong>Session ID:</strong> {{ sessionId }}</p>
          <p><strong>Error:</strong> {{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStripe } from '@/composables/useStripe'
import { getUserFriendlyMessage } from '@/utils/helpers'

export default {
  name: 'PaymentSuccess',
  setup() {
    const route = useRoute()
    const { formatPrice, verifyPayment, clearCart } = useStripe()

    // Reactive state
    const loading = ref(true)
    const paymentVerified = ref(false)
    const orderDetails = ref(null)
    const error = ref(null)
    const sessionId = ref(null)
    const errorMessage = ref('')

    // Computed properties
    const canDownloadInvoice = computed(() => {
      return (
        orderDetails.value &&
        orderDetails.value.payment_status === 'succeeded' &&
        orderDetails.value.status !== 'cancelled'
      )
    })

    // Methods
    const verifyPaymentStatus = async () => {
      try {
        sessionId.value = route.query.session_id

        if (!sessionId.value) {
          throw new Error('No se proporcionó ID de sesión. Verifica que el enlace sea correcto o intenta nuevamente desde el carrito.')
        }

        const result = await verifyPayment(sessionId.value)

        if (result.payment_verified) {
          paymentVerified.value = true
          orderDetails.value = result.order

          // Clear cart on successful payment
          clearCart()

          // Store success in localStorage for other tabs
          localStorage.setItem(
            'payment_success',
            JSON.stringify({
              orderId: result.order?.id,
              timestamp: Date.now(),
            })
          )
        } else {
          paymentVerified.value = false
          errorMessage.value = 'No pudimos verificar tu pago. Si realizaste el pago correctamente, por favor contacta con soporte para que podamos ayudarte.'
        }
      } catch (err) {
        console.error('PaymentSuccess: Error verifying payment:', err)
        paymentVerified.value = false
        error.value = err.message
        errorMessage.value = getUserFriendlyMessage(err)
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const getStatusText = (status) => {
      const statusMap = {
        pending: 'Pendiente',
        processing: 'Procesando',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cancelled: 'Cancelado',
        disputed: 'Disputado',
      }
      return statusMap[status] || status
    }

    const downloadInvoice = async () => {
      try {
        if (!orderDetails.value) return

        // Call API to generate and download invoice
        const response = await fetch(
          `/.netlify/functions/generate-invoice?order_id=${orderDetails.value.id}`
        )

        if (!response.ok) {
          throw new Error('No se pudo generar la factura')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `factura-${orderDetails.value.order_number}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error('PaymentSuccess: Error downloading invoice:', err)
        alert('No se pudo descargar la factura. Por favor, intenta nuevamente o contacta con soporte si el problema persiste.')
      }
    }

    // Lifecycle
    onMounted(() => {
      verifyPaymentStatus()

      // Clean up any old payment success data (older than 1 hour)
      const successData = localStorage.getItem('payment_success')
      if (successData) {
        const data = JSON.parse(successData)
        const oneHourAgo = Date.now() - 60 * 60 * 1000
        if (data.timestamp < oneHourAgo) {
          localStorage.removeItem('payment_success')
        }
      }
    })

    return {
      loading,
      paymentVerified,
      orderDetails,
      error,
      sessionId,
      errorMessage,
      canDownloadInvoice,
      formatPrice,
      formatDate,
      getStatusText,
      downloadInvoice,
    }
  },
}
</script>
