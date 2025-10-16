<template>
  <div class="error-page">
    <Header />

    <main class="error-container">
      <div class="error-content">
        <h1 class="error-code">500</h1>
        <h2 class="error-title">Algo salió mal</h2>
        <p class="error-description">Lo sentimos, tenemos un error inesperado.</p>

        <div class="error-actions">
          <button @click="reloadPage" class="error-btn error-btn--primary">Reintentar</button>
          <router-link to="/" class="error-btn error-btn--secondary"> Ir al inicio </router-link>
        </div>

        <!-- Información de contacto -->
        <div class="error-help">
          <p class="error-help-text">Si el problema persiste, puedes contactarnos:</p>
          <a href="mailto:hackeed.es@proton.me" class="error-contact-link">
            hackeed.es@proton.me
          </a>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'

const reloadPage = () => {
  window.location.reload()
}
</script>
