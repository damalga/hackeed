<template>
  <div>
    <Header />
    <main class="home-main">
      <Hero />
      <Slider />
      <Products title="Productos destacados" :limit="4" :show-title="true" />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header_comp.vue'
import Hero from '../components/Hero_comp.vue'
import Slider from '../components/Slider_comp.vue'
import Products from '../components/Products_comp.vue'
import Contact from '../components/Contact_comp.vue'
import Footer from '../components/Footer_comp.vue'
</script>
