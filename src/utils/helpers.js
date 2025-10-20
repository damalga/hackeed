// =============================================================================
// HELPERS - Common utilities
// =============================================================================

/**
 * STRIPE HELPERS
 * Utility functions for Stripe integration
 */

// Format price according to locale settings
export function formatPrice(amount, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount)
}

// Convert euros to cents (Stripe format)
export function eurosToStripeAmount(euros) {
  return Math.round(euros * 100)
}

// Convert Stripe cents to euros
export function stripeAmountToEuros(stripeAmount) {
  return stripeAmount / 100
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate Spanish phone number format
export function isValidSpanishPhone(phone) {
  const cleanPhone = phone.replace(/\s/g, '')
  return /^(\+34|0034|34)?[6789]\d{8}$/.test(cleanPhone)
}

/**
 * CART HELPERS
 * Shopping cart utility functions
 */

// Calculate cart totals
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

// Validate product quantity
export function validateQuantity(quantity, max = 10) {
  const qty = parseInt(quantity) || 1
  return Math.max(1, Math.min(max, qty))
}

/**
 * SEO / URL HELPERS
 * URL and SEO-friendly slug generation
 */

// Generate SEO-friendly slug from text
export function generateSlug(text) {
  if (!text) return ''

  return text
    .toLowerCase()
    .trim()
    // Replace Spanish special characters
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ü/g, 'u')
    // Replace spaces and non-alphanumeric chars with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
}

// Generate product slug (name + id for uniqueness)
export function getProductSlug(product) {
  if (!product) return ''
  const nameSlug = generateSlug(product.name)
  return `${nameSlug}-${product.id}`
}

// Extract product ID from slug (supports UUIDs)
export function getProductIdFromSlug(slug) {
  if (!slug) return null

  // Slug format: product-name-UUID
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 hyphen-separated groups)

  const parts = slug.split('-')

  // If last 5 parts look like UUID, reconstruct it
  if (parts.length >= 5) {
    // Last 5 elements form the UUID
    const uuidParts = parts.slice(-5)

    // Verify UUID format
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

  // Fallback: parse as number (for future compatibility)
  const id = parseInt(parts[parts.length - 1])
  return isNaN(id) ? null : id
}

// Generate complete product URL
export function getProductUrl(product, baseUrl = '') {
  const slug = getProductSlug(product)
  return `${baseUrl}/product/${slug}`
}

/**
 * DATE HELPERS
 * Date formatting utilities
 */

// Format date for user display
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

// Format short date
export function formatDateShort(dateString, locale = 'es-ES') {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale)
}

// Generate timestamp
export function generateTimestamp() {
  return Date.now()
}

/**
 * UI HELPERS
 * User interface utility functions
 */

// Get order status text
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

// Get CSS class for order status
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

// Truncate text to max length
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * DEVELOPMENT HELPERS
 * Development and debugging utilities
 */

// Log with timestamp
export function debugLog(message, data = null) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[${timestamp}] ${message}`)
    if (data) console.log(data)
  }
}

// Generate simple unique ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate order number
export function generateOrderNumber() {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `ORD-${dateStr}-${randomStr}`
}

/**
 * SECURITY HELPERS
 * Security and validation utilities
 */

// Sanitize user input
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic brackets
    .substring(0, 1000) // Limit length
}

// Validate customer data
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
 * API HELPERS
 * API request handling utilities
 */

// Handle API response
export function handleApiResponse(response, data) {
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`)
  }
  return data
}

// Create standard request headers
export function createApiHeaders(includeAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (includeAuth) {
    // Add authentication tokens if needed
    // headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * DATA HELPERS
 * Data manipulation utilities
 */

// Group array of objects by property
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

// Sort array of objects
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

// Remove duplicates from array
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
 * STORAGE HELPERS
 * localStorage utilities with error handling
 */

// Save to localStorage with error handling
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    debugLog('Error guardando en localStorage:', error)
    return false
  }
}

// Load from localStorage with error handling
export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    debugLog('Error loading from localStorage:', error)
    return defaultValue
  }
}

// Clear localStorage entry
export function clearStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    debugLog('Error clearing localStorage:', error)
    return false
  }
}

/**
 * CONSTANTS
 * Application-wide constants
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

// Default configuration
export const DEFAULT_CONFIG = {
  CURRENCY: 'EUR',
  LOCALE: 'es-ES',
  FREE_SHIPPING_THRESHOLD: 50,
  STANDARD_SHIPPING_COST: 5.99,
  EXPRESS_SHIPPING_COST: 12.99,
  TAX_RATE: 0.21, // 21% VAT
  MIN_QUANTITY_PER_ITEM: 1,
  MAX_QUANTITY_PER_ITEM: 10
}

// Quantity validation limits
export const QUANTITY_LIMITS = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 1
}

/**
 * ERROR HANDLING
 * Consistent error handling utilities
 */

// Error categories
export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  STRIPE: 'stripe',
  SERVER: 'server',
  UNKNOWN: 'unknown'
}

// Categorize error by type
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

// Get user-friendly error message
export function getUserFriendlyMessage(error) {
  if (!error) return 'Ha ocurrido un error desconocido'

  const category = categorizeError(error)
  const originalMessage = error.message || 'Error desconocido'

  // User-friendly messages by category
  const friendlyMessages = {
    [ERROR_CATEGORIES.NETWORK]: 'Problema de conexión. Verifica tu conexión a internet e intenta nuevamente.',
    [ERROR_CATEGORIES.VALIDATION]: originalMessage, // Validation messages are usually clear
    [ERROR_CATEGORIES.STRIPE]: 'Hubo un problema con el sistema de pagos. Por favor intenta nuevamente.',
    [ERROR_CATEGORIES.SERVER]: 'Error en el servidor. Por favor intenta nuevamente en unos momentos.',
    [ERROR_CATEGORIES.UNKNOWN]: 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.'
  }

  return friendlyMessages[category] || originalMessage
}

// Handle and log errors
export function handleError(error, context = '') {
  const category = categorizeError(error)
  const timestamp = new Date().toISOString()

  // Detailed logging in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`Error ${context ? `[${context}]` : ''}`)
    console.error('Timestamp:', timestamp)
    console.error('Category:', category)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.groupEnd()
  } else {
    // Simplified logging in production
    console.error(`Error [${context}]:`, error.message)
  }

  // Could send errors to tracking service like Sentry
  // sendErrorToTracking(error, context, category)

  return {
    category,
    message: error.message,
    friendlyMessage: getUserFriendlyMessage(error),
    timestamp
  }
}
