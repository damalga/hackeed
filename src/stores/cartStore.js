import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { loadStripe } from '@stripe/stripe-js';
import { useProductVariantsStore } from "./productVariantsStore";

export const useCartStore = defineStore("cart", () => {
  // Cargar datos del localStorage al inicializar
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('hackeed_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.warn('Error loading cart from localStorage:', error);
      return [];
    }
  };

  // Guardar datos en localStorage
  const saveCartToStorage = (cartItems) => {
    try {
      localStorage.setItem('hackeed_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.warn('Error saving cart to localStorage:', error);
    }
  };

  // Estado del carrito
  const items = ref(loadCartFromStorage());

  // Estado de Stripe
  const loading = ref(false);
  const error = ref(null);
  const stripe = ref(null);
  const currency = ref('EUR');

  // Configuración de Stripe con verificación
  const checkStripeConfig = () => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY no está configurada');
      console.log('📋 Para configurar Stripe:');
      console.log('1. Ve a https://dashboard.stripe.com/test/apikeys');
      console.log('2. Copia tu Publishable key (pk_test_...)');
      console.log('3. Agrega VITE_STRIPE_PUBLISHABLE_KEY=tu_clave en el archivo .env');
      console.log('4. Reinicia el servidor de desarrollo');
      return null;
    }

    if (!publishableKey.startsWith('pk_')) {
      console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY debe empezar con "pk_"');
      return null;
    }

    console.log('✅ Stripe configurado correctamente');
    return publishableKey;
  };

  const publishableKey = checkStripeConfig();
  const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

  // Watcher para guardar cambios automáticamente
  watch(
    items,
    (newItems) => {
      saveCartToStorage(newItems);
    },
    { deep: true }
  );

  // Getters (computadas)
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  });

  const cartItems = computed(() => items.value);

  // Actions (funciones)
  const addToCart = (product) => {
    const variantsStore = useProductVariantsStore();

    // Crear un identificador único que incluya las variantes
    const cartItemId = getCartItemId(product);

    const existingItem = items.value.find(
      (item) => item.cartItemId === cartItemId,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // Obtener precio y nombre con variantes
      const finalPrice = variantsStore.getProductPrice(product);
      const fullName = variantsStore.getProductFullName(product);
      const selectedOption = variantsStore.getSelectedOption(product);

      items.value.push({
        id: product.id,
        cartItemId: cartItemId, // ID único para el item en carrito
        name: fullName, // nombre con variante incluida
        originalName: product.name,
        desc: product.desc,
        img: product.img,
        price: finalPrice,
        quantity: 1,
        variants: product.variants
          ? {
              selected: variantsStore.getProductVariants(product.id),
              option: selectedOption,
            }
          : null,
      });
    }
    // El watcher se encarga de guardar automáticamente
  };

  const removeFromCart = (cartItemId) => {
    const index = items.value.findIndex(
      (item) => item.cartItemId === cartItemId,
    );
    if (index > -1) {
      items.value.splice(index, 1);
    }
    // El watcher se encarga de guardar automáticamente
  };

  const updateQuantity = (cartItemId, quantity) => {
    const item = items.value.find((item) => item.cartItemId === cartItemId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(cartItemId);
      } else {
        item.quantity = quantity;
      }
    }
    // El watcher se encarga de guardar automáticamente
  };

  const clearCart = () => {
    items.value = [];
    // El watcher se encarga de guardar automáticamente
  };

  // Generar ID único para item del carrito (incluye variantes)
  const getCartItemId = (product) => {
    if (!product.variants) {
      return `${product.id}`;
    }

    const variantsStore = useProductVariantsStore();
    const variants = variantsStore.getProductVariants(product.id);
    const variantString = Object.entries(variants)
      .map(([key, value]) => `${key}:${value}`)
      .join("|");
    return `${product.id}-${variantString}`;
  };

  // Verificar si un producto está en el carrito (con variantes específicas)
  const isInCart = (product) => {
    const cartItemId = getCartItemId(product);
    return items.value.some((item) => item.cartItemId === cartItemId);
  };

  // Obtener la cantidad de un producto específico en el carrito (con variantes)
  const getItemQuantity = (product) => {
    const cartItemId = getCartItemId(product);
    const item = items.value.find((item) => item.cartItemId === cartItemId);
    return item ? item.quantity : 0;
  };

  // ============= FUNCIONES DE STRIPE =============

  // Inicializar Stripe
  const initStripe = async () => {
    try {
      if (!stripePromise) {
        throw new Error('Stripe no está configurado correctamente. Revisa la configuración de VITE_STRIPE_PUBLISHABLE_KEY');
      }

      console.log('🔄 Inicializando Stripe...');
      stripe.value = await stripePromise;

      if (!stripe.value) {
        throw new Error('No se pudo cargar Stripe');
      }

      console.log('✅ Stripe inicializado correctamente');
      return stripe.value;
    } catch (err) {
      error.value = 'Error al cargar Stripe: ' + err.message;
      console.error('❌ Error inicializando Stripe:', err);
      return null;
    }
  };

  // Crear sesión de checkout
  const createCheckoutSession = async (customerInfo = {}) => {
    loading.value = true;
    error.value = null;

    try {
      console.log('🚀 Creando sesión de checkout...');
      console.log('Cart items:', items.value);
      console.log('Customer info:', customerInfo);

      // Verificar que hay items en el carrito
      if (!items.value || items.value.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Verificar configuración de Stripe
      if (!publishableKey) {
        throw new Error('Stripe no está configurado. Revisa las variables de entorno.');
      }

      const response = await fetch('/.netlify/functions/stripe_checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items.value,
          customerEmail: customerInfo.email || 'test@example.com'
        })
      });

      console.log('Response status:', response.status);
      const session = await response.json();
      console.log('Response data:', session);

      if (!response.ok) {
        throw new Error(session.error || session.message || 'Error al crear la sesión de pago');
      }

      if (!session.id) {
        throw new Error('Respuesta inválida del servidor: falta session.id');
      }

      return session;
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error creando sesión de checkout:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Redirigir a Stripe Checkout
  const redirectToCheckout = async (customerInfo = {}) => {
    try {
      console.log('🔄 Iniciando redirección a checkout...');

      // Verificar configuración antes de continuar
      if (!publishableKey) {
        throw new Error('Stripe no está configurado. Revisa las variables de entorno VITE_STRIPE_PUBLISHABLE_KEY.');
      }

      const stripeInstance = await initStripe();
      if (!stripeInstance) {
        throw new Error('No se pudo inicializar Stripe. Verifica tu clave pública.');
      }

      const session = await createCheckoutSession(customerInfo);
      console.log('✅ Sesión creada, redirigiendo...', session.id);

      if (session.url) {
        // Redirección directa usando la URL de la sesión (más confiable)
        console.log('🔗 Redirigiendo a:', session.url);
        window.location.href = session.url;
      } else {
        // Fallback al método tradicional
        console.log('🔗 Usando redirectToCheckout con session ID:', session.id);
        const { error: redirectError } = await stripeInstance.redirectToCheckout({
          sessionId: session.id
        });

        if (redirectError) {
          throw new Error(redirectError.message);
        }
      }
    } catch (err) {
      error.value = err.message;
      console.error('❌ Error en redirección a checkout:', err);
      throw err;
    }
  };

  // Verificar estado de pago
  const verifyPayment = async (sessionId) => {
    try {
      const response = await fetch(`/.netlify/functions/stripe_verify?session_id=${sessionId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al verificar el pago');
      }

      return result;
    } catch (err) {
      error.value = err.message;
      console.error('Error verificando pago:', err);
      throw err;
    }
  };

  // Formatear precio para mostrar
  const formatPrice = (price, currencyCode = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currencyCode
    }).format(price);
  };

  return {
    // Estado del carrito
    items,

    // Estado de Stripe
    loading,
    error,
    currency,

    // Getters del carrito
    totalItems,
    totalPrice,
    cartItems,

    // Actions del carrito
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getCartItemId,

    // Actions de Stripe
    initStripe,
    createCheckoutSession,
    redirectToCheckout,
    verifyPayment,
    formatPrice,
  };
});
