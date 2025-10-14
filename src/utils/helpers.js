// =============================================================================
// HELPERS - Utilidades comunes para la aplicación
// =============================================================================

/**
 * 🛍️ STRIPE HELPERS
 * Funciones utilitarias para trabajar con Stripe
 */

// Formatear precios según la configuración local
export function formatPrice(amount, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount)
}

// Convertir euros a centavos (formato Stripe)
export function eurosToStripeAmount(euros) {
  return Math.round(euros * 100)
}

// Convertir centavos de Stripe a euros
export function stripeAmountToEuros(stripeAmount) {
  return stripeAmount / 100
}

// Validar email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar teléfono español
export function isValidSpanishPhone(phone) {
  const cleanPhone = phone.replace(/\s/g, '')
  return /^(\+34|0034|34)?[6789]\d{8}$/.test(cleanPhone)
}

/**
 * 🛒 CART HELPERS
 * Funciones para manejar el carrito de compras
 */

// Calcular totales del carrito
export function calculateCartTotals(items, options = {}) {
  const {
    freeShippingThreshold = 50,
    standardShippingCost = 5.99,
    taxRate = 0.21
  } = options

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingCost
  const taxAmount = subtotal * taxRate
  const total = subtotal + shippingCost + taxAmount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    isFreeShipping: subtotal >= freeShippingThreshold
  }
}

// Validar cantidad de producto
export function validateQuantity(quantity, max = 10) {
  const qty = parseInt(quantity) || 1
  return Math.max(1, Math.min(max, qty))
}

/**
 * 🔗 SEO / URL HELPERS
 * Funciones para generar URLs y slugs SEO-friendly
 */

// Generar slug SEO-friendly desde texto
export function generateSlug(text) {
  if (!text) return ''

  return text
    .toLowerCase()
    .trim()
    // Reemplazar caracteres especiales españoles
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ü/g, 'u')
    // Reemplazar espacios y caracteres no alfanuméricos con guiones
    .replace(/[^a-z0-9]+/g, '-')
    // Eliminar guiones al inicio y final
    .replace(/^-+|-+$/g, '')
}

// Generar slug de producto (nombre + id para unicidad)
export function getProductSlug(product) {
  if (!product) return ''
  const nameSlug = generateSlug(product.name)
  return `${nameSlug}-${product.id}`
}

// Extraer ID de producto desde slug (soporta UUIDs)
export function getProductIdFromSlug(slug) {
  if (!slug) return null

  // El slug tiene formato: nombre-producto-UUID
  // Necesitamos extraer el UUID al final
  // UUID formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 grupos separados por guiones)

  const parts = slug.split('-')

  // Si tiene al menos 5 partes al final que parecen UUID, reconstruirlo
  if (parts.length >= 5) {
    // Los últimos 5 elementos forman el UUID
    const uuidParts = parts.slice(-5)

    // Verificar que tienen el formato correcto de UUID
    if (
      uuidParts[0].length === 8 &&
      uuidParts[1].length === 4 &&
      uuidParts[2].length === 4 &&
      uuidParts[3].length === 4 &&
      uuidParts[4].length === 12
    ) {
      return uuidParts.join('-')
    }
  }

  // Fallback: intentar parsear como número (para compatibilidad futura)
  const id = parseInt(parts[parts.length - 1])
  return isNaN(id) ? null : id
}

// Generar URL completa de producto
export function getProductUrl(product, baseUrl = '') {
  const slug = getProductSlug(product)
  return `${baseUrl}/product/${slug}`
}

/**
 * 📅 DATE HELPERS
 * Funciones para formatear fechas
 */

// Formatear fecha para mostrar al usuario
export function formatDate(dateString, locale = 'es-ES') {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatear fecha corta
export function formatDateShort(dateString, locale = 'es-ES') {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale)
}

// Generar timestamp
export function generateTimestamp() {
  return Date.now()
}

/**
 * 🎨 UI HELPERS
 * Funciones para mejorar la experiencia de usuario
 */

// Obtener texto de estado de orden
export function getOrderStatusText(status) {
  const statusMap = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    disputed: 'Disputado'
  }
  return statusMap[status] || status
}

// Obtener clase CSS para estado de orden
export function getOrderStatusClass(status) {
  const classMap = {
    pending: 'status-pending',
    processing: 'status-processing',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
    disputed: 'status-disputed'
  }
  return classMap[status] || 'status-default'
}

// Truncar texto
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * 🔧 DEVELOPMENT HELPERS
 * Funciones útiles para desarrollo y debugging
 */

// Log con timestamp
export function debugLog(message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[${timestamp}] ${message}`)
    if (data) console.log(data)
  }
}

// Generar ID único simple
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generar número de orden
export function generateOrderNumber() {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `ORD-${dateStr}-${randomStr}`
}

/**
 * 🔐 SECURITY HELPERS
 * Funciones de seguridad y validación
 */

// Sanitizar input de usuario
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover brackets básicos
    .substring(0, 1000) // Limitar longitud
}

// Validar datos de cliente
export function validateCustomerData(customerData) {
  const errors = []

  if (!customerData.email || !isValidEmail(customerData.email)) {
    errors.push('Email válido es requerido')
  }

  if (!customerData.name || customerData.name.trim().length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres')
  }

  if (customerData.phone && !isValidSpanishPhone(customerData.phone)) {
    errors.push('Formato de teléfono inválido')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 🌐 API HELPERS
 * Funciones para manejar llamadas a APIs
 */

// Manejar respuestas de API
export function handleApiResponse(response, data) {
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`)
  }
  return data
}

// Crear headers estándar para requests
export function createApiHeaders(includeAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (includeAuth) {
    // Aquí podrías agregar tokens de autenticación si los usas
    // headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * 📊 DATA HELPERS
 * Funciones para manipular datos
 */

// Agrupar array de objetos por una propiedad
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

// Ordenar array de objetos
export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

// Eliminar duplicados de array
export function uniqueBy(array, key) {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 💾 STORAGE HELPERS
 * Funciones para manejar localStorage
 */

// Guardar en localStorage con manejo de errores
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    debugLog('Error guardando en localStorage:', error)
    return false
  }
}

// Cargar desde localStorage con manejo de errores
export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    debugLog('Error cargando desde localStorage:', error)
    return defaultValue
  }
}

// Limpiar localStorage
export function clearStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    debugLog('Error limpiando localStorage:', error)
    return false
  }
}

/**
 * 🎯 CONSTANTS
 * Constantes útiles para la aplicación
 */

export const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  REQUIRE_3D_SECURE: '4000002500003155',
  INSUFFICIENT_FUNDS: '4000000000009995'
}

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed'
}

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

// Configuración por defecto
export const DEFAULT_CONFIG = {
  CURRENCY: 'EUR',
  LOCALE: 'es-ES',
  FREE_SHIPPING_THRESHOLD: 50,
  STANDARD_SHIPPING_COST: 5.99,
  EXPRESS_SHIPPING_COST: 12.99,
  TAX_RATE: 0.21, // 21% IVA
  MIN_QUANTITY_PER_ITEM: 1,
  MAX_QUANTITY_PER_ITEM: 10
}

// Límites de cantidad para validación
export const QUANTITY_LIMITS = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 1
}

/**
 * ⚠️ ERROR HANDLING
 * Funciones para manejar errores de forma consistente
 */

// Categorías de errores
export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  STRIPE: 'stripe',
  SERVER: 'server',
  UNKNOWN: 'unknown'
}

// Categorizar error basado en su tipo
export function categorizeError(error) {
  if (!error) return ERROR_CATEGORIES.UNKNOWN

  const message = error.message?.toLowerCase() || ''

  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('conexión')) {
    return ERROR_CATEGORIES.NETWORK
  }

  // Validation errors
  if (message.includes('validación') || message.includes('inválido') || message.includes('requerido')) {
    return ERROR_CATEGORIES.VALIDATION
  }

  // Stripe errors
  if (message.includes('stripe') || message.includes('pago') || message.includes('checkout')) {
    return ERROR_CATEGORIES.STRIPE
  }

  // Server errors
  if (message.includes('server') || message.includes('servidor') || message.includes('http')) {
    return ERROR_CATEGORIES.SERVER
  }

  return ERROR_CATEGORIES.UNKNOWN
}

// Obtener mensaje amigable para el usuario
export function getUserFriendlyMessage(error) {
  if (!error) return 'Ha ocurrido un error desconocido'

  const category = categorizeError(error)
  const originalMessage = error.message || 'Error desconocido'

  // Mensajes amigables por categoría
  const friendlyMessages = {
    [ERROR_CATEGORIES.NETWORK]: 'Problema de conexión. Verifica tu conexión a internet e intenta nuevamente.',
    [ERROR_CATEGORIES.VALIDATION]: originalMessage, // Los mensajes de validación suelen ser claros
    [ERROR_CATEGORIES.STRIPE]: 'Hubo un problema con el sistema de pagos. Por favor intenta nuevamente.',
    [ERROR_CATEGORIES.SERVER]: 'Error en el servidor. Por favor intenta nuevamente en unos momentos.',
    [ERROR_CATEGORIES.UNKNOWN]: 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.'
  }

  return friendlyMessages[category] || originalMessage
}

// Manejar y registrar errores
export function handleError(error, context = '') {
  const category = categorizeError(error)
  const timestamp = new Date().toISOString()

  // Log detallado en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.group(`❌ Error ${context ? `[${context}]` : ''}`)
    console.error('Timestamp:', timestamp)
    console.error('Category:', category)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.groupEnd()
  } else {
    // Log simplificado en producción
    console.error(`Error [${context}]:`, error.message)
  }

  // Aquí podrías enviar errores a un servicio de tracking como Sentry
  // sendErrorToTracking(error, context, category)

  return {
    category,
    message: error.message,
    friendlyMessage: getUserFriendlyMessage(error),
    timestamp
  }
}
