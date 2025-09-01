<template>
  <div>
    <Header />
    <main class="about-main">
      <div class="about-container">
        <section class="about-section">
        <h2>Hackeed</h2>
        <p>
            Además de una tienda es un proyecto abierto, una invitación a hackear, compartir y jugar.<br>
            Nos gusta poner a prueba sistemas, desarmarlos y volver a montarlos. Siempre desde una perspectiva ética.<br>
            O meta-ética, según quién lo mire :).<br>
            <br>
            ¿Y si la ética también fuera otro cuestionable sistema?<br>
            En fin... cuestionar, deconstruir y construir. Nunca destruir. Ese es el espíritu!<br>
            <br>
            Si tienes ideas, dudas, proyectos, o simplemente quieres pensar en voz alta, <router-link to="/contact">contacta</router-link>.<br>
            Esta web la tienes en <a href="#">Github</a>. El frontal está construido con <a href="#">Vue</a>,<br>
            gracias a Evan You y toda esa comunidad global que tira del carro del software libre.<br>
            <br>
            Hackeed es eso: un laboratorio vivo donde la curiosidad manda.
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
