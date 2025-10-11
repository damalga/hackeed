/**
 * errorMessages.js
 *
 * Sistema centralizado para categorizar y formatear mensajes de error
 * de forma informativa y accionable para el usuario.
 */

/**
 * Categorías de errores con mensajes descriptivos
 */
export const ERROR_CATEGORIES = {
  // Errores de red/conectividad
  NETWORK: {
    code: 'NETWORK_ERROR',
    title: 'Problema de conexión',
    message: 'No se pudo conectar con el servicio de pagos. Verifica tu conexión a internet.',
    action: 'Revisa tu conexión e intenta de nuevo',
    icon: '🌐'
  },

  // Errores de configuración (más técnicos, para desarrollo)
  CONFIG: {
    code: 'CONFIG_ERROR',
    title: 'Error de configuración',
    message: 'Hay un problema con la configuración del sistema de pagos.',
    action: 'Contacta con el soporte técnico',
    icon: '⚙️'
  },

  // Errores de validación (datos del usuario)
  VALIDATION: {
    code: 'VALIDATION_ERROR',
    title: 'Datos incompletos',
    message: 'Algunos datos necesarios están incompletos o son incorrectos.',
    action: 'Revisa los datos e intenta nuevamente',
    icon: '⚠️'
  },

  // Errores de stock/inventario
  INVENTORY: {
    code: 'INVENTORY_ERROR',
    title: 'Producto no disponible',
    message: 'El producto que intentas comprar ya no está disponible o no hay suficiente stock.',
    action: 'Actualiza tu carrito y revisa la disponibilidad',
    icon: '📦'
  },

  // Errores de pago (Stripe)
  PAYMENT: {
    code: 'PAYMENT_ERROR',
    title: 'Error al procesar el pago',
    message: 'No se pudo procesar tu pago. El método de pago puede haber sido rechazado.',
    action: 'Intenta con otro método de pago o contacta con tu banco',
    icon: '💳'
  },

  // Errores de sesión (checkout)
  SESSION: {
    code: 'SESSION_ERROR',
    title: 'Error al crear sesión',
    message: 'No se pudo iniciar la sesión de pago.',
    action: 'Intenta nuevamente en unos momentos',
    icon: '🔐'
  },

  // Carrito vacío
  EMPTY_CART: {
    code: 'EMPTY_CART',
    title: 'Carrito vacío',
    message: 'No hay productos en tu carrito.',
    action: 'Agrega productos antes de continuar',
    icon: '🛒'
  },

  // Error genérico (cuando no podemos categorizar)
  GENERIC: {
    code: 'GENERIC_ERROR',
    title: 'Algo salió mal',
    message: 'Ocurrió un error inesperado.',
    action: 'Intenta nuevamente o contacta con soporte si el problema persiste',
    icon: '❌'
  }
};

/**
 * Mapeo de patrones de error a categorías
 * Permite detectar automáticamente el tipo de error según el mensaje
 */
const ERROR_PATTERNS = [
  {
    patterns: [
      /network/i,
      /conexión/i,
      /connection/i,
      /fetch.*failed/i,
      /no se pudo conectar/i,
      /offline/i,
      /timeout/i
    ],
    category: ERROR_CATEGORIES.NETWORK
  },
  {
    patterns: [
      /stripe.*no.*configurado/i,
      /vite_stripe/i,
      /publishable.*key/i,
      /secret.*key/i,
      /api.*key/i,
      /configuración/i
    ],
    category: ERROR_CATEGORIES.CONFIG
  },
  {
    patterns: [
      /carrito.*vacío/i,
      /carrito vacio/i,
      /cart.*empty/i,
      /no hay.*productos/i
    ],
    category: ERROR_CATEGORIES.EMPTY_CART
  },
  {
    patterns: [
      /stock/i,
      /no.*disponible/i,
      /agotado/i,
      /producto.*no.*existe/i,
      /inactivo/i,
      /out of stock/i
    ],
    category: ERROR_CATEGORIES.INVENTORY
  },
  {
    patterns: [
      /pago.*rechazado/i,
      /payment.*failed/i,
      /card.*declined/i,
      /tarjeta/i,
      /insufficient.*funds/i
    ],
    category: ERROR_CATEGORIES.PAYMENT
  },
  {
    patterns: [
      /sesión/i,
      /session/i,
      /checkout/i
    ],
    category: ERROR_CATEGORIES.SESSION
  },
  {
    patterns: [
      /invalid/i,
      /inválido/i,
      /requerido/i,
      /required/i,
      /missing/i
    ],
    category: ERROR_CATEGORIES.VALIDATION
  }
];

/**
 * Categoriza un error automáticamente basándose en su mensaje
 * @param {Error|string} error - El error a categorizar
 * @returns {Object} Categoría del error con sus propiedades
 */
export function categorizeError(error) {
  const errorMessage = typeof error === 'string' ? error : error.message || '';

  // Buscar coincidencia en patrones
  for (const { patterns, category } of ERROR_PATTERNS) {
    if (patterns.some(pattern => pattern.test(errorMessage))) {
      return category;
    }
  }

  // Si no encuentra coincidencia, devuelve error genérico
  return ERROR_CATEGORIES.GENERIC;
}

/**
 * Formatea un error en un mensaje amigable para el usuario
 * @param {Error|string} error - El error a formatear
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.includeOriginal - Si incluir el mensaje original (para desarrollo)
 * @param {boolean} options.includeIcon - Si incluir el icono
 * @returns {string} Mensaje formateado
 */
export function formatErrorMessage(error, options = {}) {
  const { includeOriginal = false, includeIcon = false } = options;
  const category = categorizeError(error);
  const originalMessage = typeof error === 'string' ? error : error.message || '';

  let message = includeIcon ? `${category.icon} ${category.message}` : category.message;

  if (category.action) {
    message += `\n${category.action}`;
  }

  // En desarrollo, incluir mensaje original para debug
  if (includeOriginal && originalMessage) {
    message += `\n\nDetalle técnico: ${originalMessage}`;
  }

  return message;
}

/**
 * Formatea un error como objeto estructurado (útil para UI)
 * @param {Error|string} error - El error a formatear
 * @param {Object} options - Opciones adicionales
 * @returns {Object} Objeto con información estructurada del error
 */
export function formatErrorObject(error, options = {}) {
  const { includeOriginal = false } = options;
  const category = categorizeError(error);
  const originalMessage = typeof error === 'string' ? error : error.message || '';

  return {
    code: category.code,
    title: category.title,
    message: category.message,
    action: category.action,
    icon: category.icon,
    ...(includeOriginal && { originalMessage })
  };
}

/**
 * Maneja un error y lo registra en consola con formato apropiado
 * @param {Error|string} error - El error a manejar
 * @param {string} context - Contexto donde ocurrió el error
 * @returns {Object} Información estructurada del error
 */
export function handleError(error, context = 'Error') {
  const category = categorizeError(error);
  const originalMessage = typeof error === 'string' ? error : error.message || '';

  // Log para desarrollo
  console.group(`${category.icon} ${context}`);
  console.error('Categoría:', category.title);
  console.error('Mensaje:', category.message);
  if (category.action) {
    console.info('Acción sugerida:', category.action);
  }
  console.error('Error original:', originalMessage);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
  console.groupEnd();

  return formatErrorObject(error, { includeOriginal: true });
}

/**
 * Versión corta para mensajes de usuario (sin detalles técnicos)
 * @param {Error|string} error - El error
 * @returns {string} Mensaje amigable
 */
export function getUserFriendlyMessage(error) {
  const category = categorizeError(error);
  return `${category.message} ${category.action}`;
}
