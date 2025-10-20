import { ref } from 'vue'

export function useProducts() {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadProducts() {
    loading.value = true
    try {
      const res = await fetch('/.netlify/functions/getProducts')
      if (!res.ok) throw new Error('Error cargando productos')
      const data = await res.json()
      
      // Data is already transformed in the backend
      products.value = data
    } catch (e) {
      error.value = e.message
      console.error('useProducts: Error loading products:', e)
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, loadProducts }
}
