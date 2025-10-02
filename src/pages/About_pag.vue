<template>
  <div>
    <Header />
    <main class="about-main">
      <div class="about-container">
        <section class="about-section">
          <h2>¿Que es Hackeed?</h2>
          <p>
            Además de una palabra medio inventada es una tienda online y un proyecto abierto.<br />
            Un laboratorio vivo donde la curiosidad manda. Una invitación a hackear, compartir y
            jugar.<br />
            <br />
            Nos gusta poner a prueba sistemas, desarmarlos y volver a montarlos.<br />
            Siempre desde una perspectiva ética. O meta-ética, según quién lo mire...<br />
            <br />
            ¿Y si la ética también fuera otro cuestionable sistema?<br />
            En fin... cuestionar, deconstruir y construir. Nunca destruir. Ese es el espíritu.<br />
            <br />
            Si tienes ideas, dudas, proyectos, o simplemente quieres pensar en voz alta,
            <router-link to="/contact">contacta</router-link>.<br />
            Esta web la tienes en
            <a href="https://github.com/damalga/hackeed" target="_blank">Github</a>. El frontal está
            construido con <a href="https://vuejs.org/" target="_blank">Vue</a>,<br />
            gracias a Evan You y toda esa comunidad global que tira del carro del software libre.
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { useSchema } from '@/composables/useSchema'
import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Cart from '../components/Cart_comp.vue'

// SEO Meta Tags
usePageMeta({
  title: 'Sobre Nosotros - Hackeed | Proyecto de Hacking Ético y Tecnología',
  description:
    'Hackeed es más que una tienda: Es un proyecto que une el hacking ético con el mundo maker y más allá, se trata de un laboratorio vivo donde la curiosidad manda. Proyecto open source serverless construido con Vue, Netlify y Neon.',
  keywords:
    'hackeed, proyecto hacking ético, comunidad hacking españa, tienda tecnología open source, digital nomad, mundo maker',
  url: 'https://hackeed.com/about',
  image: 'https://hackeed.com/images/og-about.jpg',
})

// Structured Data - AboutPage Schema
useSchema({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Sobre Hackeed',
  description:
    'Hackeed es más que una tienda: Es un proyecto que une el hacking ético con el mundo maker y más allá, se trata de un laboratorio vivo donde la curiosidad manda.',
  url: 'https://hackeed.com/about',
  mainEntity: {
    '@type': 'Organization',
    name: 'Hackeed',
    description:
      'Proyecto abierto de hacking ético, mundo maker y desarrollo/programación. Un laboratorio vivo donde la curiosidad manda. Una invitación a hackear, compartir y jugar.',
    url: 'https://hackeed.com',
    foundingDate: '2025',
    email: 'hackeed.es@proton.me',
    sameAs: ['https://github.com/damalga/hackeed'],
    knowsAbout: [
      'Hardware Hacking',
      'Pentesting',
      'Ciberseguridad',
      'Ethical Hacking',
      'Tecnología Open Source',
      'Digital Nomad',
      'Guerrilla Hacking',
      'Mundo Maker',
      'Indie Hacker',
      'Tienda Hack',
      'Hack shop',
      'Informática España',
    ],
  },
})
</script>
