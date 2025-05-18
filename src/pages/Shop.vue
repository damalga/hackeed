<template>
  <div>
    <Header @toggle-cart="showCart = !showCart" />
    <section class="max-w-5xl mx-auto py-12">
      <h2 class="text-3xl font-bold mb-8 text-center">Productos top hacker</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        <div v-for="product in products" :key="product.id" class="border border-black rounded-2xl p-5">
          <img :src="product.img" :alt="product.name" class="aspect-square object-cover mb-4 rounded-xl" />
          <h3 class="font-semibold text-xl mb-1">{{ product.name }}</h3>
          <p class="text-gray-600 text-base mb-4">{{ product.desc }}</p>
          <button class="mt-auto w-full px-4 py-2 rounded bg-black text-white font-bold hover:bg-gray-900 transition">Añadir al carrito</button>
        </div>
      </div>
    </section>
    <Footer />
    <Carrito :show="showCart" @close="showCart = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import Carrito from '../components/Cart.vue'

const showCart = ref(false)

const products = [
  {
    id: 1,
    name: 'Flipper Zero',
    desc: 'La navaja suiza del hacking portátil. Lector RFID, infrarrojos, radio...',
    img: 'https://flipperzero.one/images/flipperzero-cute-transparent.png'
  },
  {
    id: 2,
    name: 'Pantalla e-ink 10"',
    desc: 'Para proyectos ultra clean y visualización permanente sin gastar energía.',
    img: 'https://www.waveshare.com/img/devkit/6/6.13inch-e-Paper-HAT-2.jpg'
  },
  {
    id: 3,
    name: 'Raspberry Pi 5',
    desc: 'La bestia mini que lo mueve todo: servidores, hacking y mucho más.',
    img: 'https://www.raspberrypi.com/documentation/computers/images/pi5.png'
  }
]
</script>
