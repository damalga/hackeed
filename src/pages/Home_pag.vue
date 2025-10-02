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
      <Product />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProducts } from '@/composables/useProducts'
import { usePageMeta } from '@/composables/usePageMeta'
import { useSchema } from '@/composables/useSchema'
import Header from '../components/Header_comp.vue'
import Hero from '../components/Hero_comp.vue'
import Slider from '../components/Slider_comp.vue'
import Products from '../components/Products_comp.vue'
import Product from '../components/Product_comp.vue'
import Contact from '../components/Contact_comp.vue'
import Footer from '../components/Footer_comp.vue'

// SEO Meta Tags
usePageMeta({
  title: 'a c k e e d | Home',
  description:
    'Tienda online especializada en hackware (hardware hacking, pentesting, mundo maker y tecnología avanzada). Envíos en 24-48h desde Madrid (España).',
  keywords:
    'tienda hacking españa, flipper zero, raspberry pi tienda, hak5, hardware pentesting, herramientas ciberseguridad, gadgets tecnología',
  url: 'https://hackeed.com',
  image: 'https://hackeed.com/images/og-home.jpg',
})

// Structured Data - Organization & WebSite
useSchema([
  // Organization Schema
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hackeed',
    url: 'https://hackeed.com',
    logo: 'https://hackeed.com/logo.png',
    description:
      'Tienda especializada en hardware hacking, pentesting y tecnología avanzada en España',
    foundingDate: '2024',
    email: 'hackeed.es@proton.me',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hackeed.es@proton.me',
      contactType: 'Customer Service',
      availableLanguage: ['Spanish', 'English'],
    },
    sameAs: [
      'https://github.com/damalga/hackeed',
      // Añadir redes sociales cuando estén disponibles
      // 'https://twitter.com/hackeed_es',
      // 'https://linkedin.com/company/hackeed'
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ES',
      addressLocality: 'Madrid',
    },
  },
  // WebSite Schema
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hackeed',
    url: 'https://hackeed.com',
    description:
      'Tienda online de hardware hacking: Flipper Zero, Raspberry Pi, Hak5 y herramientas de pentesting',
    publisher: {
      '@type': 'Organization',
      name: 'Hackeed',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://hackeed.com/shop?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
])

// Cargar productos desde Neon DB
const { products, loadProducts } = useProducts()

onMounted(loadProducts)
</script>
