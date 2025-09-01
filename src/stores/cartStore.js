import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProductVariantsStore } from './productVariantsStore'

export const useCartStore = defineStore('cart', () => {
  // Estado
  const items = ref([])


  // Getters (computadas)
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const cartItems = computed(() => items.value)

  // Actions (funciones)
  const addToCart = (product) => {
    const variantsStore = useProductVariantsStore()
    
    // Crear un identificador único que incluya las variantes
    const cartItemId = getCartItemId(product)
    
    const existingItem = items.value.find(item => item.cartItemId === cartItemId)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      // Obtener precio y nombre con variantes
      const finalPrice = variantsStore.getProductPrice(product)
      const fullName = variantsStore.getProductFullName(product)
      const selectedOption = variantsStore.getSelectedOption(product)
      
      items.value.push({
        id: product.id,
        cartItemId: cartItemId, // ID único para el item en carrito
        name: fullName, // nombre con variante incluida
        originalName: product.name,
        desc: product.desc,
        img: product.img,
        price: finalPrice,
        quantity: 1,
        variants: product.variants ? {
          selected: variantsStore.getProductVariants(product.id),
          option: selectedOption
        } : null
      })
    }
  }

  const removeFromCart = (cartItemId) => {
    const index = items.value.findIndex(item => item.cartItemId === cartItemId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (cartItemId, quantity) => {
    const item = items.value.find(item => item.cartItemId === cartItemId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(cartItemId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const clearCart = () => {
    items.value = []
  }



  // Generar ID único para item del carrito (incluye variantes)
  const getCartItemId = (product) => {
    if (!product.variants) {
      return `${product.id}`
    }
    
    const variantsStore = useProductVariantsStore()
    const variants = variantsStore.getProductVariants(product.id)
    const variantString = Object.entries(variants).map(([key, value]) => `${key}:${value}`).join('|')
    return `${product.id}-${variantString}`
  }

  // Verificar si un producto está en el carrito (con variantes específicas)
  const isInCart = (product) => {
    const cartItemId = getCartItemId(product)
    return items.value.some(item => item.cartItemId === cartItemId)
  }

  // Obtener la cantidad de un producto específico en el carrito (con variantes)
  const getItemQuantity = (product) => {
    const cartItemId = getCartItemId(product)
    const item = items.value.find(item => item.cartItemId === cartItemId)
    return item ? item.quantity : 0
  }

  return {
    // Estado
    items,
    
    // Getters
    totalItems,
    totalPrice,
    cartItems,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getCartItemId
  }
})