import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        desc: product.desc,
        img: product.img,
        price: product.price || 99, // precio por defecto si no existe
        quantity: 1
      })
    }
  }

  const removeFromCart = (productId) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId, quantity) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const clearCart = () => {
    items.value = []
  }



  // Verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return items.value.some(item => item.id === productId)
  }

  // Obtener la cantidad de un producto específico en el carrito
  const getItemQuantity = (productId) => {
    const item = items.value.find(item => item.id === productId)
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
    getItemQuantity
  }
})