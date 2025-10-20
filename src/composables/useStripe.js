/**
 * useStripe - Wrapper para retrocompatibilidad
 *
 * Este composable es solo un alias del cartStore para mantener
 * compatibilidad con componentes existentes que usaban useStripe.
 *
 * La lógica real del carrito y Stripe ahora vive en:
 * @see src/stores/cartStore.js
 *
 * NOTA: En nuevos componentes, usa directamente useCartStore en lugar de este wrapper.
 */

import { useCartStore } from '@/stores/cartStore';

export function useStripe() {
  const cartStore = useCartStore();

  // Devolvemos todos los métodos y propiedades del cartStore
  // manteniendo la misma API que tenía useStripe antes
  return {
    // Estado del carrito
    cart: {
      items: cartStore.items,
      total: cartStore.totalPrice,
      currency: cartStore.currency,
    },

    // Estado de Stripe
    loading: cartStore.loading,
    error: cartStore.error,

    // Métodos del carrito (pasamos directamente desde el store)
    addToCart: cartStore.addToCart,
    removeFromCart: cartStore.removeFromCart,
    updateCartQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
    getCartItemCount: () => cartStore.totalItems,
    saveCartToStorage: () => {
      // Ya no es necesario, el cartStore lo hace automáticamente con un watcher
      console.log('useStripe: saveCartToStorage is deprecated, cart auto-saves now');
    },
    loadCartFromStorage: () => {
      // Ya no es necesario, el cartStore lo carga al inicializar
      console.log('useStripe: loadCartFromStorage is deprecated, cart auto-loads now');
    },

    // Métodos de Stripe
    initStripe: cartStore.initStripe,
    createCheckoutSession: cartStore.createCheckoutSession,
    redirectToCheckout: cartStore.redirectToCheckout,
    verifyPayment: cartStore.verifyPayment,

    // Utilidades
    formatPrice: cartStore.formatPrice,
    calculateTotal: () => cartStore.totalPrice, // Ya es computed en el store
  };
}
