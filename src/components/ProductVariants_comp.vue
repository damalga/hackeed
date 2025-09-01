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
            'selected': selectedOption === option.id,
            'out-of-stock': !option.inStock
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
              <span v-else-if="option.priceDiff < 0" class="price-diff discount">-€{{ Math.abs(option.priceDiff) }}</span>
              <span class="final-price">€{{ option.price }}</span>
            </span>
          </div>
          <div v-if="!option.inStock" class="out-of-stock-badge">Agotado</div>
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
    required: true
  }
})

const emit = defineEmits(['variant-changed'])

const variantsStore = useProductVariantsStore()

// Opción seleccionada actualmente
const selectedOption = computed(() => {
  if (!props.product.variants) return null
  return variantsStore.getSelectedVariant(props.product.id, props.product.variants.name) || props.product.variants.default
})

// Datos de la opción seleccionada
const selectedOptionData = computed(() => {
  if (!props.product.variants || !selectedOption.value) return null
  return props.product.variants.options.find(opt => opt.id === selectedOption.value)
})

// Función para seleccionar una opción
const selectOption = (optionId) => {
  variantsStore.selectVariant(props.product.id, props.product.variants.name, optionId)
  
  // Emitir evento para que el componente padre sepa que cambió
  emit('variant-changed', {
    productId: props.product.id,
    variantName: props.product.variants.name,
    optionId: optionId,
    option: props.product.variants.options.find(opt => opt.id === optionId)
  })
}

// Inicializar variante por defecto al montar
onMounted(() => {
  if (props.product.variants && props.product.variants.default) {
    variantsStore.initializeProductDefaults(props.product)
  }
})
</script>

<style scoped>
.product-variants {
  margin: 20px 0;
}

.variant-group {
  margin-bottom: 20px;
}

.variant-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 15px 0;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
}

.variant-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.variant-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;

  &:hover:not(.out-of-stock) {
    border-color: var(--accent-primary);
  }

  &.selected {
    border-color: var(--accent-primary);
    background: rgba(0, 255, 0, 0.1);
  }

  &.out-of-stock {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--bg-secondary);
  }
}

.variant-radio {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.variant-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.variant-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.variant-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-diff {
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-primary);

  &.discount {
    color: #ff6b6b;
  }
}

.final-price {
  font-weight: bold;
  color: var(--text-primary);
  font-size: 14px;
}

.out-of-stock-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--error);
  color: var(--text-primary);
  font-size: 10px;
  padding: 2px 6px;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 20px;
  border: 1px solid var(--error);
}

.variant-features {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  padding: 15px;
  margin-top: 15px;
}

.features-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 10px 0;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
}

.features-list {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.features-list li {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 5px;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
}

/* Responsive */
@media (max-width: 768px) {
  .variant-option {
    padding: 10px 12px;
  }

  .variant-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .variant-price {
    align-self: flex-end;
  }
}
</style>