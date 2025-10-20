import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { loadStripe } from '@stripe/stripe-js';
import { useProductVariantsStore } from "./productVariantsStore";
import { handleError, getUserFriendlyMessage, ERROR_CATEGORIES, QUANTITY_LIMITS, validateQuantity } from "@/utils/helpers";

export const useCartStore = defineStore("cart", () => {
  // Load cart data from localStorage on initialization
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('hackeed_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.warn('Error loading cart from localStorage:', error);
      return [];
    }
  };

  // Persist cart data to localStorage
  const saveCartToStorage = (cartItems) => {
    try {
      localStorage.setItem('hackeed_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.warn('Error saving cart to localStorage:', error);
    }
  };

  // Cart state
  const items = ref(loadCartFromStorage());

  // Stripe state
  const loading = ref(false);
  const error = ref(null);
  const stripe = ref(null);
  const currency = ref('EUR');

  // Validate Stripe configuration
  const checkStripeConfig = () => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('VITE_STRIPE_PUBLISHABLE_KEY not configured');
      console.log('To configure Stripe:');
      console.log('1. Go to https://dashboard.stripe.com/test/apikeys');
      console.log('2. Copy your Publishable key (pk_test_...)');
      console.log('3. Add VITE_STRIPE_PUBLISHABLE_KEY=your_key in .env file');
      console.log('4. Restart development server');
      return null;
    }

    if (!publishableKey.startsWith('pk_')) {
      console.error('VITE_STRIPE_PUBLISHABLE_KEY must start with "pk_"');
      return null;
    }

    console.log('Stripe configured correctly');
    return publishableKey;
  };

  const publishableKey = checkStripeConfig();
  const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

  // Auto-save cart changes to localStorage
  watch(
    items,
    (newItems) => {
      saveCartToStorage(newItems);
    },
    { deep: true }
  );

  // Computed getters
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

  // Cart actions
  const addToCart = (product) => {
    const variantsStore = useProductVariantsStore();

    // Verify product availability before adding
    if (!variantsStore.isProductAvailable(product)) {
      error.value = 'Este producto no está disponible';
      setTimeout(() => {
        error.value = null;
      }, 3000);
      return false;
    }

    // Generate unique identifier including variants
    const cartItemId = getCartItemId(product);

    const existingItem = items.value.find(
      (item) => item.cartItemId === cartItemId,
    );

    if (existingItem) {
      // Verify stock before incrementing quantity
      const variantStock = variantsStore.getVariantStock(product);

      // Validate against numeric stock if available
      if (variantStock !== null && existingItem.quantity >= variantStock) {
        error.value = `Stock máximo alcanzado (${variantStock} unidades disponibles)`;
        setTimeout(() => {
          error.value = null;
        }, 3000);
        return false;
      }

      // Validate against max quantity limit
      if (existingItem.quantity >= QUANTITY_LIMITS.MAX) {
        error.value = `Máximo ${QUANTITY_LIMITS.MAX} unidades por producto`;
        setTimeout(() => {
          error.value = null;
        }, 3000);
        return false;
      }

      existingItem.quantity += 1;
    } else {
      // Get price and name with variants
      const finalPrice = variantsStore.getProductPrice(product);
      const fullName = variantsStore.getProductFullName(product);
      const selectedOption = variantsStore.getSelectedOption(product);

      items.value.push({
        id: product.id,
        cartItemId: cartItemId, // Unique ID for cart item
        name: fullName, // Name including variant
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
    // Auto-saved via watcher
    return true;
  };

  const removeFromCart = (cartItemId) => {
    const index = items.value.findIndex(
      (item) => item.cartItemId === cartItemId,
    );
    if (index > -1) {
      items.value.splice(index, 1);
    }
    // Auto-saved via watcher
  };

  const updateQuantity = (cartItemId, quantity) => {
    const item = items.value.find((item) => item.cartItemId === cartItemId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(cartItemId);
      } else {
        // Validate quantity using helper function
        const validatedQuantity = validateQuantity(quantity, QUANTITY_LIMITS.MAX);

        // Show warning if limit exceeded
        if (quantity > QUANTITY_LIMITS.MAX) {
          console.warn('Quantity exceeds maximum limit of', QUANTITY_LIMITS.MAX, 'units per product');
          error.value = `Máximo ${QUANTITY_LIMITS.MAX} unidades por producto`;

          // Clear error after 3 seconds
          setTimeout(() => {
            error.value = null;
          }, 3000);
        }

        item.quantity = validatedQuantity;
      }
    }
    // Auto-saved via watcher
  };

  const clearCart = () => {
    items.value = [];
    // Auto-saved via watcher
  };

  // Generate unique cart item ID (includes variants)
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

  // Check if product with specific variants is in cart
  const isInCart = (product) => {
    const cartItemId = getCartItemId(product);
    return items.value.some((item) => item.cartItemId === cartItemId);
  };

  // Get quantity of specific product in cart (with variants)
  const getItemQuantity = (product) => {
    const cartItemId = getCartItemId(product);
    const item = items.value.find((item) => item.cartItemId === cartItemId);
    return item ? item.quantity : 0;
  };

  // ============= STRIPE FUNCTIONS =============

  // Initialize Stripe
  const initStripe = async () => {
    try {
      if (!stripePromise) {
        throw new Error('Stripe no está configurado correctamente. Revisa la configuración de VITE_STRIPE_PUBLISHABLE_KEY');
      }

      console.log('Initializing Stripe');
      stripe.value = await stripePromise;

      if (!stripe.value) {
        throw new Error('No se pudo cargar Stripe');
      }

      console.log('Stripe initialized successfully');
      return stripe.value;
    } catch (err) {
      handleError(err, 'Inicialización de Stripe');
      error.value = getUserFriendlyMessage(err);
      return null;
    }
  };

  // Create Stripe checkout session
  const createCheckoutSession = async (customerInfo = {}) => {
    loading.value = true;
    error.value = null;

    try {
      console.log('Creating checkout session');
      console.log('Cart items:', items.value);
      console.log('Customer info:', customerInfo);

      // Verify cart is not empty
      if (!items.value || items.value.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Verify Stripe configuration
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
      handleError(err, 'Creación de sesión de checkout');
      error.value = getUserFriendlyMessage(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Redirect to Stripe Checkout
  const redirectToCheckout = async (customerInfo = {}) => {
    try {
      console.log('Starting redirect to checkout');

      // Verify configuration before proceeding
      if (!publishableKey) {
        throw new Error('Stripe no está configurado. Revisa las variables de entorno VITE_STRIPE_PUBLISHABLE_KEY.');
      }

      const stripeInstance = await initStripe();
      if (!stripeInstance) {
        throw new Error('No se pudo inicializar Stripe. Verifica tu clave pública.');
      }

      const session = await createCheckoutSession(customerInfo);
      console.log('Session created, redirecting. Session ID:', session.id);

      if (session.url) {
        console.log('Redirecting to:', session.url);
        window.location.href = session.url;
      } else {
        console.log('Using redirectToCheckout with session ID:', session.id);
        const { error: redirectError } = await stripeInstance.redirectToCheckout({
          sessionId: session.id
        });

        if (redirectError) {
          throw new Error(redirectError.message);
        }
      }
    } catch (err) {
      handleError(err, 'Redirección a checkout');
      error.value = getUserFriendlyMessage(err);
      throw err;
    }
  };

  // Verify payment status
  const verifyPayment = async (sessionId) => {
    try {
      const response = await fetch(`/.netlify/functions/stripe_verify?session_id=${sessionId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al verificar el pago');
      }

      return result;
    } catch (err) {
      handleError(err, 'Verificación de pago');
      error.value = getUserFriendlyMessage(err);
      throw err;
    }
  };

  // Format price for display
  const formatPrice = (price, currencyCode = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currencyCode
    }).format(price);
  };

  return {
    // Cart state
    items,

    // Stripe state
    loading,
    error,
    currency,

    // Cart getters
    totalItems,
    totalPrice,
    cartItems,

    // Cart actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getCartItemId,

    // Stripe actions
    initStripe,
    createCheckoutSession,
    redirectToCheckout,
    verifyPayment,
    formatPrice,
  };
});
