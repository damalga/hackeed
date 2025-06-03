<template>
  <div>
    <Header @toggle-cart="showCart = !showCart" />
    <section class="shop-section">
      <h2 class="shop-title">
        Productos top hacker
      </h2>
      <div class="shop-grid">
        <div
          v-for="product in products"
          :key="product.id"
          class="shop-card"
        >
          <img
            :src="product.img"
            :alt="product.name"
            class="shop-img"
          />
          <h3 class="shop-product-title">
            {{ product.name }}
          </h3>
          <p class="shop-product-desc">
            {{ product.desc }}
          </p>
          <button class="shop-add-cart">
            Añadir al carrito
          </button>
        </div>
      </div>
    </section>
    <Footer />
    <Carrito :show="showCart" @close="showCart = false" />
  </div>
</template>

<script setup>
import { ref } from "vue";

import products from '../data/products_data.js'

import Header from "../components/Header_comp.vue";
import Footer from "../components/Footer_comp.vue";
import Carrito from "../components/Cart_comp.vue";

const showCart = ref(false);

</script>
