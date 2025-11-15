import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductVariantsStore = defineStore('productVariants', () => {
  // Estado: variantes seleccionadas por producto
  // Formato: { productId: { variantId: "selected_option_id" } }
  const selectedVariants = ref({})

  // Función para obtener la variante seleccionada de un producto
  const getSelectedVariant = (productId, variantId) => {
    return selectedVariants.value[productId]?.[variantId] || null
  }

  // Función para seleccionar una variante
  const selectVariant = (productId, variantId, optionId) => {
    if (!selectedVariants.value[productId]) {
      selectedVariants.value[productId] = {}
    }
    selectedVariants.value[productId][variantId] = optionId
  }

  // Función para obtener todas las variantes seleccionadas de un producto
  const getProductVariants = (productId) => {
    return selectedVariants.value[productId] || {}
  }

  // Función para calcular el precio final de un producto con variantes
  const getProductPrice = (product) => {
    if (!product.variants) {
      return product.price
    }

    const productVariants = getProductVariants(product.id)
    let finalPrice = product.price

    // Si tiene variantes pero no hay selección, usar la opción por defecto
    const selectedOption = productVariants[product.variants.name] || product.variants.default

    if (selectedOption) {
      const option = product.variants.options.find(opt => opt.id === selectedOption)
      if (option) {
        finalPrice = option.price
      }
    }

    return finalPrice
  }

  // Función para obtener el nombre completo del producto con variantes
  const getProductFullName = (product) => {
    if (!product.variants) {
      return product.name
    }

    const productVariants = getProductVariants(product.id)
    const selectedOption = productVariants[product.variants.name] || product.variants.default

    if (selectedOption) {
      const option = product.variants.options.find(opt => opt.id === selectedOption)
      if (option) {
        return `${product.name} (${option.name})`
      }
    }

    return product.name
  }

  // Función para obtener las características del producto con variantes
  const getProductFeatures = (product) => {
    let features = [...product.features]

    if (product.variants) {
      const productVariants = getProductVariants(product.id)
      const selectedOption = productVariants[product.variants.name] || product.variants.default

      if (selectedOption) {
        const option = product.variants.options.find(opt => opt.id === selectedOption)
        if (option && option.features) {
          // Reemplazar o añadir características de la variante
          features = features.concat(option.features)
        }
      }
    }

    return features
  }

  // Función para verificar si un producto está disponible con la variante seleccionada
  const isProductAvailable = (product) => {
    if (!product.variants) {
      return product.inStock
    }

    const productVariants = getProductVariants(product.id)
    const selectedOption = productVariants[product.variants.name] || product.variants.default

    if (selectedOption) {
      const option = product.variants.options.find(opt => opt.id === selectedOption)
      if (option) {
        // Verificar stock: si existe campo 'stock', usarlo; si no, usar 'inStock'
        return option.stock !== undefined ? option.stock > 0 : option.inStock
      }
    }

    return product.inStock
  }

  // Función para verificar si un producto tiene al menos una variante en stock
  const hasAnyVariantInStock = (product) => {
    if (!product.variants || !product.variants.options) {
      return product.inStock
    }

    // Verificar si al menos una variante tiene stock
    return product.variants.options.some(option => {
      return option.stock !== undefined ? option.stock > 0 : option.inStock
    })
  }

  // Función para obtener el stock disponible de la variante seleccionada
  const getVariantStock = (product) => {
    if (!product.variants) {
      return null // No hay variantes, no aplica
    }

    const productVariants = getProductVariants(product.id)
    const selectedOption = productVariants[product.variants.name] || product.variants.default

    if (selectedOption) {
      const option = product.variants.options.find(opt => opt.id === selectedOption)
      if (option) {
        return option.stock !== undefined ? option.stock : null
      }
    }

    return null
  }

  // Función para obtener la opción seleccionada completa
  const getSelectedOption = (product) => {
    if (!product.variants) {
      return null
    }

    const productVariants = getProductVariants(product.id)
    const selectedOption = productVariants[product.variants.name] || product.variants.default

    if (selectedOption) {
      return product.variants.options.find(opt => opt.id === selectedOption)
    }

    return null
  }

  // Función para inicializar variantes por defecto de un producto
  const initializeProductDefaults = (product) => {
    if (product.variants && product.variants.default && !selectedVariants.value[product.id]) {
      selectVariant(product.id, product.variants.name, product.variants.default)
    }
  }

  // Función para limpiar variantes de un producto
  const clearProductVariants = (productId) => {
    delete selectedVariants.value[productId]
  }

  // Función para limpiar todas las variantes
  const clearAllVariants = () => {
    selectedVariants.value = {}
  }

  return {
    // Estado
    selectedVariants,

    // Getters/Actions
    getSelectedVariant,
    selectVariant,
    getProductVariants,
    getProductPrice,
    getProductFullName,
    getProductFeatures,
    isProductAvailable,
    hasAnyVariantInStock,
    getVariantStock,
    getSelectedOption,
    initializeProductDefaults,
    clearProductVariants,
    clearAllVariants
  }
})
