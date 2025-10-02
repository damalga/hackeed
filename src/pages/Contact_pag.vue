<template>
  <Header />
  <Contact />
  <Footer />
</template>

<script setup>
import { ref } from 'vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { useSchema } from '@/composables/useSchema'
import Header from '../components/Header_comp.vue'
import Contact from '../components/Contact_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Cart from '../components/Cart_comp.vue'

// SEO Meta Tags
usePageMeta({
  title: 'a c k e e d | Contacto',
  description:
    'Contacta con Hackeed para consultas sobre productos, soporte técnico o colaboraciones. Escríbenos a hackeed.es@proton.me',
  keywords: 'contacto hackeed, soporte técnico, consultas pentesting, ayuda compra hardware',
  url: 'https://hackeed.com/contact',
  image: 'https://hackeed.com/images/og-contact.jpg',
})

// Structured Data - ContactPage Schema
useSchema({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contacto - Hackeed',
  description:
    'Contacta con Hackeed para consultas sobre productos, soporte técnico o colaboraciones. Escríbenos a hackeed.es@proton.me',
  url: 'https://hackeed.com/contact',
  mainEntity: {
    '@type': 'Organization',
    name: 'Hackeed',
    email: 'hackeed.es@proton.me',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hackeed.es@proton.me',
      contactType: 'Customer Service',
      availableLanguage: ['Spanish', 'English'],
      areaServed: 'ES',
    },
  },
})

const showCart = ref(false)
</script>
