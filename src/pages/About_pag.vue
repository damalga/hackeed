<template>
  <div>
    <Header @toggle-cart="showCart = !showCart" />
    <section class="max-w-2xl mx-auto my-32 text-center">
      <h2 class="text-4xl font-bold mb-4">Sobre hackonlin.es</h2>
      <p class="text-lg text-gray-700">
        Hackonlin HACKonline hackOnlines la tienda más hacker-hack testing maker maderfacker.<br>
        Aquí aún humo, solo hardware guapo y herramientas para abrir el mundo.<br>
        <br>
        Además de tienda es un proyecto abierto, una invitación a hackear, a compartir, a jugar y a construir.<br>
        También somos fans de romper la seguridad de un sistema... siempre que sea con fines éticos (o meta-éticos según quién lo mire :).<br>
        ¿Y si la ética también fuera solo otro cuestionable sistema?<br>
        En fin... cuestionar, crear, destruir y volver a construir. Ese es el espíritu.<br>
        Si tienes ideas, dudas, proyectos, o simplemente quieres pensar en voz alta, <a>contacta</a>.<br>
        <br>
        Esta web la tienes en <a>Github</a>:
        Esto tiene montado el frontal <a>Vue</a>, gracias al genio de Evan You y toda esa comunidad global que tira del carro del software libre.<br>
        Los estilos van con <a>TailwindCSS</a>, porque la comunidad mola, la documentación es clara y hay soporte hasta en la sopa.<br>
        TypeScript es como JavaScript, pero con red de seguridad. Así podemos experimentar y escalar sin miedo a pisarnos los cables.<br>
        <br>
      </p>
    </section>
    <Footer />
    <Cart :show="showCart" @close="showCart = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Cart from '../components/Cart_comp.vue'

const showCart = ref(false)
</script>
