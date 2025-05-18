<template>
  <div>
    <Header @toggle-cart="showCart = !showCart" />
    <section class="text-center my-32">
      <h1 class="text-5xl font-bold mb-4">Hardware hacker para almas inquietas</h1>
      <p class="text-xl text-gray-600 mb-8">Flipper Zero, pantallas e-ink y gadgets de culto.</p>
      <router-link to="/shop" class="px-8 py-3 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 transition">Explorar tienda</router-link>
    </section>
    <Footer />
    <Cart :show="showCart" @close="showCart = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import Cart from '../components/Cart.vue'

const showCart = ref(false)
</script>
