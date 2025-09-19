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
import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Cart from '../components/Cart_comp.vue'
</script>
