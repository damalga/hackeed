<template>
  <div v-if="product.variants" class="product-variants">
    <div class="variant-group">
      <h4 class="variant-title">{{ product.variants.name }}</h4>
      <div class="variant-options">
        <label
          v-for="option in product.variants.options"
          :key="option.id"
          class="variant-option"
          :class="{
            selected: selectedOption === option.id,
            'out-of-stock': !option.inStock,
          }"
        >
          <input
            type="radio"
            :name="`variant-${product.id}-${product.variants.name}`"
            :value="option.id"
            :checked="selectedOption === option.id"
            :disabled="!option.inStock"
            @change="selectOption(option.id)"
            class="variant-radio"
          />
          <div class="variant-info">
            <span class="variant-name">{{ option.name }}</span>
            <span class="variant-price">
              <span v-if="option.priceDiff > 0" class="price-diff">+€{{ option.priceDiff }}</span>
              <span v-else-if="option.priceDiff < 0" class="price-diff discount"
                >-€{{ Math.abs(option.priceDiff) }}</span
              >
              <span class="final-price">€{{ option.price }}</span>
            </span>
          </div>
          <!-- Stock info -->
          <div v-if="!option.inStock" class="out-of-stock-badge">Agotado</div>
          <div v-else-if="option.stock !== undefined && option.stock <= 5" class="low-stock-badge">
            Solo {{ option.stock }} {{ option.stock === 1 ? 'unidad' : 'unidades' }}
          </div>
        </label>
      </div>
    </div>

    <!-- Mostrar características de la opción seleccionada -->
    <div v-if="selectedOptionData && selectedOptionData.features" class="variant-features">
      <h5 class="features-title">Incluye:</h5>
      <ul class="features-list">
        <li v-for="feature in selectedOptionData.features" :key="feature">
          {{ feature }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductVariantsStore } from '@/stores/productVariantsStore'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['variant-changed'])

const variantsStore = useProductVariantsStore()

// Opción seleccionada actualmente
const selectedOption = computed(() => {
  if (!props.product.variants) return null
  return (
    variantsStore.getSelectedVariant(props.product.id, props.product.variants.name) ||
    props.product.variants.default
  )
})

// Datos de la opción seleccionada
const selectedOptionData = computed(() => {
  if (!props.product.variants || !selectedOption.value) return null
  return props.product.variants.options.find((opt) => opt.id === selectedOption.value)
})

// Función para seleccionar una opción
const selectOption = (optionId) => {
  variantsStore.selectVariant(props.product.id, props.product.variants.name, optionId)

  // Emitir evento para que el componente padre sepa que cambió
  emit('variant-changed', {
    productId: props.product.id,
    variantName: props.product.variants.name,
    optionId: optionId,
    option: props.product.variants.options.find((opt) => opt.id === optionId),
  })
}

// Inicializar variante por defecto al montar
onMounted(() => {
  if (props.product.variants && props.product.variants.default) {
    variantsStore.initializeProductDefaults(props.product)
  }
})
</script>
