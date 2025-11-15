<template>
  <Header />

  <main class="product-detail-page">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <p>Cargando producto...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <h2>Producto no encontrado</h2>
      <p>{{ error }}</p>
      <router-link to="/shop" class="back-to-shop-btn">Volver a la tienda</router-link>
    </div>

    <!-- Product detail -->
    <div v-else-if="product" class="product-detail-container">
      <div class="product-detail-content">
        <!-- Galería de imágenes -->
        <div class="product-images">
          <div class="main-image">
            <img
              :src="'../' + selectedImage"
              :alt="`${product.name} - Vista ${currentImageIndex + 1} de ${totalImages}`"
            />
            <!-- Flechas de navegación -->
            <button
              v-if="product.images && product.images.length > 1"
              class="image-nav-arrow image-nav-arrow--left"
              @click="previousImage"
              aria-label="Imagen anterior"
            >
              &#8592;
            </button>
            <button
              v-if="product.images && product.images.length > 1"
              class="image-nav-arrow image-nav-arrow--right"
              @click="nextImage"
              aria-label="Siguiente imagen"
            >
              &#8594;
            </button>
            <!-- Indicador de posición -->
            <div
              v-if="product.images && product.images.length > 1"
              class="image-counter"
              aria-live="polite"
            >
              {{ currentImageIndex + 1 }} / {{ totalImages }}
            </div>
          </div>
          <div v-if="product.images && product.images.length > 1" class="image-thumbnails">
            <button
              v-for="(image, index) in product.images"
              :key="index"
              class="thumbnail"
              :class="{ active: selectedImage === image }"
              @click="selectImage(index)"
              :aria-label="`Ver imagen ${index + 1} de ${totalImages}`"
              :aria-current="selectedImage === image ? 'true' : 'false'"
            >
              <img :src="'../' + image" :alt="`${product.name} - miniatura ${index + 1}`" />
            </button>
          </div>
        </div>

        <!-- Info producto -->
        <div class="product-detail">
          <div class="product-header">
            <h1 class="product-title">
              {{ variantsStore.getProductFullName(product) }}
            </h1>
            <div class="product-categories">
              <span
                v-if="Array.isArray(product.category)"
                v-for="cat in product.category"
                :key="cat"
                class="product-category"
                >{{ cat }}</span
              >
              <span v-else-if="product.category" class="product-category">{{
                product.category
              }}</span>
            </div>
          </div>

          <div class="product-price">
            <span class="price">€{{ variantsStore.getProductPrice(product) }}</span>
            <span v-if="variantsStore.hasAnyVariantInStock(product)" class="stock in-stock"
              >Disponible</span
            >
            <span v-else class="stock out-of-stock">Agotado</span>
          </div>

          <p class="product-description">
            {{ product.longDesc || product.desc }}
          </p>

          <!-- Selector de variantes -->
          <ProductVariants
            v-if="product.variants"
            :product="product"
            @variant-changed="onVariantChanged"
          />

          <!-- Características -->
          <div v-if="currentFeatures && currentFeatures.length" class="product-features">
            <h6>Características principales:</h6>
            <ul>
              <li v-for="feature in currentFeatures" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="buttons-detail">
        <!-- Botón volver a tienda -->
        <button @click="navigateToShop" class="back-to-shop">Volver a la tienda</button>
        <div v-if="cartStore.isInCart(product)" class="quantity-controls">
          <button
            class="quantity-btn"
            @click="updateQuantity(cartStore.getItemQuantity(product) - 1)"
            aria-label="Disminuir cantidad"
            :aria-describedby="`quantity-${product.id}`"
          >
            -
          </button>
          <span class="quantity" :id="`quantity-${product.id}`" role="status" aria-live="polite">
            {{ cartStore.getItemQuantity(product) }}
          </span>
          <button
            class="quantity-btn"
            @click="updateQuantity(cartStore.getItemQuantity(product) + 1)"
            aria-label="Aumentar cantidad"
            :aria-describedby="`quantity-${product.id}`"
            :disabled="isMaxQuantityReached"
            :title="isMaxQuantityReached ? `Máximo ${QUANTITY_LIMITS.MAX} unidades` : ''"
          >
            +
          </button>
          <button class="remove-btn" @click="removeFromCart" aria-label="Quitar del carrito">
            Quitar del carrito
          </button>
        </div>
        <button
          v-else
          class="add-to-cart-btn"
          @click="addToCart"
          :disabled="!variantsStore.isProductAvailable(product)"
          :aria-label="
            variantsStore.isProductAvailable(product) ? 'Añadir al carrito' : 'Producto agotado'
          "
        >
          {{ variantsStore.isProductAvailable(product) ? 'Añadir al carrito' : 'Agotado' }}
        </button>
      </div>
    </div>
  </main>

  <Footer />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageMeta } from '@/composables/usePageMeta'
import { useProducts } from '@/composables/useProducts'
import { useCartStore } from '@/stores/cartStore'
import { useProductVariantsStore } from '@/stores/productVariantsStore'
import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import ProductVariants from '../components/ProductVariants_comp.vue'
import { QUANTITY_LIMITS, getProductIdFromSlug, getProductUrl } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const { products, loadProducts, loading: productsLoading } = useProducts()
const cartStore = useCartStore()
const variantsStore = useProductVariantsStore()

const selectedImage = ref('')
const currentImageIndex = ref(0)
const loading = ref(true)
const error = ref(null)

// Obtener producto desde slug
const product = computed(() => {
  const slug = route.params.slug
  if (!slug || !products.value.length) return null

  const productId = getProductIdFromSlug(slug)
  if (!productId) return null

  return products.value.find((p) => p.id === productId)
})

// Total de imágenes
const totalImages = computed(() => {
  if (product.value && product.value.images && product.value.images.length > 0) {
    return product.value.images.length
  }
  return 1
})

// Verificar si se ha alcanzado el máximo de cantidad
const isMaxQuantityReached = computed(() => {
  if (!product.value) return false
  return cartStore.getItemQuantity(product.value) >= QUANTITY_LIMITS.MAX
})

// Características actuales del producto (incluyendo variantes)
const currentFeatures = computed(() => {
  if (product.value) {
    return variantsStore.getProductFeatures(product.value)
  }
  return []
})

// Meta tags dinámicos SEO
watch(
  product,
  (newProduct) => {
    if (newProduct) {
      const productUrl = getProductUrl(newProduct, import.meta.env.VITE_APP_URL)
      const imageUrl = newProduct.images?.[0] || newProduct.img

      usePageMeta({
        title: `${newProduct.name} | Hackeed`,
        description:
          newProduct.longDesc || newProduct.desc || `Compra ${newProduct.name} en Hackeed`,
        url: productUrl,
        image: imageUrl,
        type: 'product',
      })
    }
  },
  { immediate: true }
)

// Funciones de navegación de imágenes
const selectImage = (index) => {
  if (product.value && product.value.images && product.value.images[index]) {
    currentImageIndex.value = index
    selectedImage.value = product.value.images[index]
  }
}

const nextImage = () => {
  if (product.value && product.value.images && product.value.images.length > 0) {
    const nextIndex = (currentImageIndex.value + 1) % product.value.images.length
    selectImage(nextIndex)
  }
}

const previousImage = () => {
  if (product.value && product.value.images && product.value.images.length > 0) {
    const prevIndex =
      (currentImageIndex.value - 1 + product.value.images.length) % product.value.images.length
    selectImage(prevIndex)
  }
}

const onVariantChanged = (variantData) => {
  // Manejar cambio de variante si es necesario
  console.log('ProductDetail: Variant changed:', variantData)
}

const addToCart = () => {
  if (product.value && variantsStore.isProductAvailable(product.value)) {
    cartStore.addToCart(product.value)
  }
}

const updateQuantity = (newQuantity) => {
  if (product.value) {
    const cartItemId = cartStore.getCartItemId(product.value)
    cartStore.updateQuantity(cartItemId, newQuantity)
  }
}

const removeFromCart = () => {
  if (product.value) {
    const cartItemId = cartStore.getCartItemId(product.value)
    cartStore.removeFromCart(cartItemId)
  }
}

const navigateToShop = () => {
  window.location.href = '/shop'
}

// Cargar productos al montar
onMounted(async () => {
  loading.value = true
  try {
    await loadProducts()

    // Verificar que el producto existe
    if (!product.value) {
      error.value = 'El producto que buscas no existe o ya no está disponible.'
    } else {
      // Inicializar imagen cuando el producto está cargado
      if (product.value.images && product.value.images.length > 0) {
        selectedImage.value = product.value.images[0]
      } else if (product.value.img) {
        selectedImage.value = product.value.img
      }
    }
  } catch (e) {
    error.value = 'Error al cargar el producto. Por favor, intenta nuevamente.'
    console.error('ProductDetail: Error loading product:', e)
  } finally {
    loading.value = false
  }
})
</script>
