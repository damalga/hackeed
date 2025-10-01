<template>
  <Header />
  <Contact />
  <Footer />
</template>

<script setup>
import { ref } from 'vue'
import { usePageMeta } from '@/composables/usePageMeta'
import Header from '../components/Header_comp.vue'
import Contact from '../components/Contact_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Cart from '../components/Cart_comp.vue'

// SEO Meta Tags
usePageMeta({
  title: 'Contacto - Soporte y Consultas | Hackeed',
  description:
    '¿Tienes dudas sobre productos o necesitas ayuda? Escríbenos a hackeed.es@proton.me. Respondemos todas las consultas sobre hardware hacking y pentesting.',
  keywords: 'contacto hackeed, soporte técnico, consultas pentesting, ayuda compra hardware',
  url: 'https://hackeed.com/contact',
  image: 'https://hackeed.com/images/og-contact.jpg',
})

const showCart = ref(false)
</script>
