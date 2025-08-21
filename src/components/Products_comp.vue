<template>
  <section class="products">
    <div class="products-container">
      <h2 class="products-title">Productos destacados</h2>
      <div class="products-grid">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="product-card"
          @click="openProductModal(product)"
        >
          <div class="product-image">
            <img :src="product.img" :alt="product.name" />
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-desc">{{ product.desc }}</p>
            <div class="product-price">€{{ product.price }}</div>
            <button class="product-cta">Ver producto</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useProductModalStore } from '@/stores/productModalStore'
import products from '@/data/products_data.js'

const productModalStore = useProductModalStore()

const openProductModal = (product) => {
  productModalStore.openModal(product)
}
</script>

<style scoped>
.products {
  padding: 60px 20px;
  background: var(--bg-primary);
}

.products-container {
  max-width: 1200px;
  margin: 0 auto;
}

.products-title {
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 50px;
  color: var(--text-primary);
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
  letter-spacing: -1px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.product-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px var(--shadow-dark);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px var(--shadow-dark);
  border-color: var(--accent-primary);
}

.product-image {
  width: 100%;
  height: 250px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  filter: brightness(1.1);
}

.product-info {
  padding: 25px;
}

.product-name {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0 0 10px 0;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
}

.product-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 15px 0;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
}

.product-price {
  font-size: 24px;
  font-weight: bold;
  color: var(--accent-primary);
  margin-bottom: 20px;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
}

.product-cta {
  width: 100%;
  padding: 12px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-primary);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Fira Mono', 'JetBrains Mono', 'Menlo', monospace;
}

.product-cta:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);
}

@media (max-width: 768px) {
  .products {
    padding: 40px 15px;
  }
  
  .products-title {
    font-size: 28px;
    margin-bottom: 30px;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>