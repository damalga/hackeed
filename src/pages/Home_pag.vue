<template>
  <div>
    <Header />
    <main class="home-main">
      <Hero />
      <Slider />
      <Products
        title="Productos destacados"
        :limit="3"
        :show-title="true"
        :products-list="products"
      />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProducts } from '@/composables/useProducts'
import { usePageMeta } from '@/composables/usePageMeta'
import Header from '../components/Header_comp.vue'
import Hero from '../components/Hero_comp.vue'
import Slider from '../components/Slider_comp.vue'
import Products from '../components/Products_comp.vue'
import Contact from '../components/Contact_comp.vue'
import Footer from '../components/Footer_comp.vue'

// SEO Meta Tags
usePageMeta({
  title: 'Hackeed - Tienda de Hardware Hacking en España | Flipper Zero, Raspberry Pi',
  description:
    'Tienda online especializada en hardware hacking y tecnología. Compra Flipper Zero, Raspberry Pi, Hak5, SDR y herramientas de pentesting. Envíos en 24-48h desde España.',
  keywords:
    'tienda hacking españa, flipper zero, raspberry pi tienda, hak5, hardware pentesting, herramientas ciberseguridad, gadgets tecnología',
  url: 'https://hackeed.com',
  image: 'https://hackeed.com/images/og-home.jpg',
})

// Cargar productos desde Neon DB
const { products, loadProducts } = useProducts()

onMounted(loadProducts)
</script>
