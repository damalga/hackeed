import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductModalStore = defineStore('productModal', () => {
  // Estado
  const isModalOpen = ref(false)
  const selectedProduct = ref(null)

  // Actions
  const openModal = (product) => {
    selectedProduct.value = product
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
    selectedProduct.value = null
  }

  const toggleModal = (product = null) => {
    if (isModalOpen.value) {
      closeModal()
    } else if (product) {
      openModal(product)
    }
  }

  return {
    // Estado
    isModalOpen,
    selectedProduct,

    // Actions
    openModal,
    closeModal,
    toggleModal
  }
})
