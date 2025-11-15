<template>
  <div v-if="productModalStore.isModalOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="closeModal" aria-label="Cerrar modal de producto">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div v-if="product" class="modal-body">
        <!-- Galería de imágenes -->
        <div class="modal-images">
          <div class="main-image">
            <img
              :src="selectedImage"
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
              <img :src="image" :alt="`${product.name} - miniatura ${index + 1}`" />
            </button>
          </div>
        </div>

        <!-- Info producto -->
        <div class="modal-info">
          <div class="product-header">
            <h2 class="product-title">
              {{ variantsStore.getProductFullName(product) }}
            </h2>
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
      <div class="buttons-modal">
        <!-- Botón para ir a la página del producto -->
        <button @click="navigateToProductPage" class="view-product-page-btn">
          Ver página completa del producto
        </button>

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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useProductModalStore } from '@/stores/productModalStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductVariantsStore } from '@/stores/productVariantsStore'
import ProductVariants from './ProductVariants_comp.vue'
import { QUANTITY_LIMITS, getProductSlug } from '@/utils/helpers'

const productModalStore = useProductModalStore()
const cartStore = useCartStore()
const variantsStore = useProductVariantsStore()

const selectedImage = ref('')
const currentImageIndex = ref(0)

const product = computed(() => productModalStore.selectedProduct)

// Computada para obtener el total de imágenes
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

// Actualizar imagen seleccionada cuando cambie el producto
watch(
  product,
  (newProduct) => {
    currentImageIndex.value = 0
    if (newProduct && newProduct.images && newProduct.images.length > 0) {
      selectedImage.value = newProduct.images[0]
    } else if (newProduct && newProduct.img) {
      selectedImage.value = newProduct.img
    }
  },
  { immediate: true }
)

const closeModal = () => {
  productModalStore.closeModal()
}

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

// Características actuales del producto (incluyendo variantes)
const currentFeatures = computed(() => {
  if (product.value) {
    return variantsStore.getProductFeatures(product.value)
  }
  return []
})

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

// Navegar a la página del producto
const navigateToProductPage = () => {
  if (!product.value) return
  const slug = getProductSlug(product.value)
  window.location.href = `/product/${slug}`
}

// Cerrar modal con tecla Escape
const handleEscapeKey = (e) => {
  if (e.key === 'Escape' && productModalStore.isModalOpen) {
    closeModal()
  }
}

// Añadir listener cuando el componente se monta
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

// Remover listener cuando el componente se desmonta (previene memory leaks)
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>
