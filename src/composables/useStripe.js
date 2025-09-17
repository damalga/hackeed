import { ref, reactive } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

// Verificar configuración de Stripe
const checkStripeConfig = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY no está configurada')
    console.log('📋 Para configurar Stripe:')
    console.log('1. Ve a https://dashboard.stripe.com/test/apikeys')
    console.log('2. Copia tu Publishable key (pk_test_...)')
    console.log('3. Agrega VITE_STRIPE_PUBLISHABLE_KEY=tu_clave en el archivo .env')
    console.log('4. Reinicia el servidor de desarrollo')
    return null
  }

  if (!publishableKey.startsWith('pk_')) {
    console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY debe empezar con "pk_"')
    return null
  }

  console.log('✅ Stripe configurado correctamente')
  return publishableKey
}

// Configuración de Stripe con verificación
const publishableKey = checkStripeConfig()
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

export function useStripe() {
  const loading = ref(false)
  const error = ref(null)
  const stripe = ref(null)

  // Estado del carrito
  const cart = reactive({
    items: [],
    total: 0,
    currency: 'EUR'
  })

  // Inicializar Stripe
  const initStripe = async () => {
    try {
      if (!stripePromise) {
        throw new Error('Stripe no está configurado correctamente. Revisa la configuración de VITE_STRIPE_PUBLISHABLE_KEY')
      }

      console.log('🔄 Inicializando Stripe...')
      stripe.value = await stripePromise

      if (!stripe.value) {
        throw new Error('No se pudo cargar Stripe')
      }

      console.log('✅ Stripe inicializado correctamente')
      return stripe.value
    } catch (err) {
      error.value = 'Error al cargar Stripe: ' + err.message
      console.error('❌ Error inicializando Stripe:', err)
      return null
    }
  }

  // Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.items.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
      existingItem.total = existingItem.price * existingItem.quantity
    } else {
      cart.items.push({
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity,
        total: product.price * quantity,
        image: product.image_url
      })
    }

    calculateTotal()
  }

  // Remover producto del carrito
  const removeFromCart = (productId) => {
    const index = cart.items.findIndex(item => item.id === productId)
    if (index > -1) {
      cart.items.splice(index, 1)
      calculateTotal()
    }
  }

  // Actualizar cantidad en el carrito
  const updateCartQuantity = (productId, quantity) => {
    const item = cart.items.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
        item.total = item.price * quantity
        calculateTotal()
      }
    }
  }

  // Calcular total del carrito
  const calculateTotal = () => {
    cart.total = cart.items.reduce((sum, item) => sum + item.total, 0)
  }

  // Limpiar carrito
  const clearCart = () => {
    cart.items = []
    cart.total = 0
  }

  // Crear sesión de checkout (versión de test)
  const createCheckoutSession = async (customerInfo = {}) => {
    loading.value = true
    error.value = null

    try {
      console.log('🚀 Creando sesión de checkout...')
      console.log('Cart items:', cart.items)
      console.log('Customer info:', customerInfo)

      // Verificar que hay items en el carrito
      if (!cart.items || cart.items.length === 0) {
        throw new Error('El carrito está vacío')
      }

      // Verificar configuración de Stripe
      if (!publishableKey) {
        throw new Error('Stripe no está configurado. Revisa las variables de entorno.')
      }

      const response = await fetch('/.netlify/functions/stripe_checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cart.items,
          customerEmail: customerInfo.email || 'test@example.com'
        })
      })

      console.log('Response status:', response.status)
      const session = await response.json()
      console.log('Response data:', session)

      if (!response.ok) {
        throw new Error(session.error || session.message || 'Error al crear la sesión de pago')
      }

      if (!session.id) {
        throw new Error('Respuesta inválida del servidor: falta session.id')
      }

      return session
    } catch (err) {
      error.value = err.message
      console.error('❌ Error creando sesión de checkout:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Redirigir a Stripe Checkout
  const redirectToCheckout = async (customerInfo = {}) => {
    try {
      console.log('🔄 Iniciando redirección a checkout...')

      // Verificar configuración antes de continuar
      if (!publishableKey) {
        throw new Error('Stripe no está configurado. Revisa las variables de entorno VITE_STRIPE_PUBLISHABLE_KEY.')
      }

      const stripeInstance = await initStripe()
      if (!stripeInstance) {
        throw new Error('No se pudo inicializar Stripe. Verifica tu clave pública.')
      }

      const session = await createCheckoutSession(customerInfo)
      console.log('✅ Sesión creada, redirigiendo...', session.id)

      if (session.url) {
        // Redirección directa usando la URL de la sesión (más confiable)
        console.log('🔗 Redirigiendo a:', session.url)
        window.location.href = session.url
      } else {
        // Fallback al método tradicional
        console.log('🔗 Usando redirectToCheckout con session ID:', session.id)
        const { error: redirectError } = await stripeInstance.redirectToCheckout({
          sessionId: session.id
        })

        if (redirectError) {
          throw new Error(redirectError.message)
        }
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error en redirección a checkout:', err)
      throw err
    }
  }

  // Procesar pago con Payment Intent (alternativa a Checkout)
  const processPayment = async (paymentMethodId, customerInfo = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/.netlify/functions/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethodId,
          items: cart.items,
          customerInfo,
          amount: Math.round(cart.total * 100), // Stripe usa centavos
          currency: cart.currency.toLowerCase()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar el pago')
      }

      // Si requiere confirmación adicional (3D Secure)
      if (result.requiresAction) {
        const stripeInstance = await initStripe()
        const { error: confirmError, paymentIntent } = await stripeInstance.confirmCardPayment(
          result.clientSecret
        )

        if (confirmError) {
          throw new Error(confirmError.message)
        }

        return paymentIntent
      }

      return result
    } catch (err) {
      error.value = err.message
      console.error('Error procesando pago:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener detalles de una orden
  const getOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/.netlify/functions/get-order?id=${orderId}`)
      const order = await response.json()

      if (!response.ok) {
        throw new Error(order.error || 'Error al obtener los detalles de la orden')
      }

      return order
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo orden:', err)
      throw err
    }
  }

  // Verificar estado de pago
  const verifyPayment = async (sessionId) => {
    try {
      const response = await fetch(`/.netlify/functions/stripe_verify?session_id=${sessionId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al verificar el pago')
      }

      return result
    } catch (err) {
      error.value = err.message
      console.error('Error verificando pago:', err)
      throw err
    }
  }

  // Formatear precio para mostrar
  const formatPrice = (price, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  // Obtener cantidad de items en el carrito
  const getCartItemCount = () => {
    return cart.items.reduce((count, item) => count + item.quantity, 0)
  }

  // Persistir carrito en localStorage
  const saveCartToStorage = () => {
    localStorage.setItem('hackeed_cart', JSON.stringify(cart))
  }

  // Cargar carrito desde localStorage
  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('hackeed_cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        cart.items = parsedCart.items || []
        cart.total = parsedCart.total || 0
        cart.currency = parsedCart.currency || 'EUR'
        calculateTotal() // Recalcular por si acaso
      } catch (err) {
        console.warn('Error cargando carrito desde localStorage:', err)
      }
    }
  }

  return {
    // Estado
    loading,
    error,
    cart,

    // Métodos del carrito
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartItemCount,
    saveCartToStorage,
    loadCartFromStorage,

    // Métodos de pago
    initStripe,
    createCheckoutSession,
    redirectToCheckout,
    processPayment,

    // Métodos de órdenes
    getOrderDetails,
    verifyPayment,

    // Utilidades
    formatPrice,
    calculateTotal
  }
}
