<template>
  <section class="products">
    <div class="products-container">
      <h2 v-if="showTitle" class="products-title">{{ title }}</h2>
      <div class="products-grid">
        <div v-for="product in displayedProducts" :key="product.id" class="product-card">
          <div class="product-image" @click="openProductModal(product)">
            <img :src="product.img" :alt="product.name" />
          </div>

          <div class="product-info">
            <h4 class="product-name" @click="openProductModal(product)">{{ product.name }}</h4>
            <p class="product-desc">{{ product.desc }}</p>
            <div class="product-values">
              <div class="product-price">€{{ product.price }}</div>

              <!-- Stock badge (solo en shop) -->
              <div v-if="showStock" class="product-stock">
                <span v-if="variantsStore.hasAnyVariantInStock(product)" class="stock-badge in-stock"
                  >Disponible</span
                >
                <span v-else class="stock-badge out-of-stock">Agotado</span>
              </div>
            </div>

            <!-- Controles del carrito (solo en shop) -->
            <div v-if="showCartControls" class="product-cart-controls">
              <div v-if="cartStore.isInCart(product)" class="quantity-controls">
                <button
                  class="quantity-btn"
                  @click="updateQuantity(product, cartStore.getItemQuantity(product) - 1)"
                >
                  −
                </button>
                <span class="quantity">{{ cartStore.getItemQuantity(product) }}</span>
                <button
                  class="quantity-btn"
                  @click="updateQuantity(product, cartStore.getItemQuantity(product) + 1)"
                >
                  +
                </button>
              </div>
              <button
                v-else
                class="product-add-cart"
                @click="addToCart(product)"
                :disabled="!variantsStore.isProductAvailable(product)"
              >
                {{ variantsStore.isProductAvailable(product) ? 'Añadir al carrito' : 'Agotado' }}
              </button>
            </div>

            <!-- Botón simple (solo en home) -->
            <button v-else class="product-cta" @click="openProductModal(product)">
              Ver producto
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductModalStore } from '@/stores/productModalStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductVariantsStore } from '@/stores/productVariantsStore'

// Props configurables
const props = defineProps({
  title: {
    type: String,
    default: 'Productos destacados',
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
  limit: {
    type: Number,
    default: null, // null = mostrar todos
  },
  productsList: {
    type: Array,
    default: () => [], // productos pasados desde el padre
  },
  showStock: {
    type: Boolean,
    default: false, // mostrar badges de stock
  },
  showCartControls: {
    type: Boolean,
    default: false, // mostrar controles de carrito
  },
})

const productModalStore = useProductModalStore()
const cartStore = useCartStore()
const variantsStore = useProductVariantsStore()

// Productos a mostrar según configuración
const displayedProducts = computed(() => {
  const productsToShow = props.productsList

  if (props.limit && props.limit > 0) {
    return productsToShow.slice(0, props.limit)
  }

  return productsToShow
})

const openProductModal = (product) => {
  // Abrir modal como antes
  productModalStore.openModal(product)
}

const addToCart = (product) => {
  // Inicializar variantes por defecto si no están configuradas
  variantsStore.initializeProductDefaults(product)

  if (variantsStore.isProductAvailable(product)) {
    cartStore.addToCart(product)
  }
}

const updateQuantity = (product, newQuantity) => {
  const cartItemId = cartStore.getCartItemId(product)
  cartStore.updateQuantity(cartItemId, newQuantity)
}

// Inicializar variantes por defecto para todos los productos
onMounted(() => {
  displayedProducts.value.forEach((product) => {
    if (product.variants) {
      variantsStore.initializeProductDefaults(product)
    }
  })
})
</script>
