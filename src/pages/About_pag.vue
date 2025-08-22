<template>
  <div>
    <Header />
    <main class="about-main">
      <div class="about-container">
        <section class="about-section">
        <h2>Sobre hackonlin.es</h2>
        <p>
            Hackonlin HACKonline hackOnlines la tienda más hacker-hack testing maker maderfacker fuck.<br>
            Aquí solo encontraras suculento hardware y herramientas para abrir el mundo.<br>
            <br>
            Además de una tienda es un proyecto abierto, una invitación a hackear, compartir y jugar.<br>
            Somos fans de romper la seguridad de un sistema... siempre que sea con fines éticos (o meta-éticos según quién lo mire :).<br>
            <br>
            ¿Y si la ética también fuera otro cuestionable sistema?<br>
            En fin... cuestionar, deconstruir y construir. Nunca destruir. Ese es el espíritu.<br>
            <br>
            Si tienes ideas, dudas, proyectos, o simplemente quieres pensar en voz alta, <a>contacta</a>.<br>
            Esta web la tienes en <a>Github</a>. El frontal está construido con<a>Vue</a>,<br>
            gracias al genio de Evan You y toda esa comunidad global que tira del carro del software libre.<br>
        </p>
        </section>
      </div>
    </main>
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
