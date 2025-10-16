<template>
  <div class="error-page">
    <Header />

    <main class="error-container">
      <div class="error-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Página no encontrada</h2>
        <p class="error-description">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div class="error-actions">
          <router-link to="/" class="error-btn error-btn--primary">
            Ir al inicio
          </router-link>
          <router-link to="/shop" class="error-btn error-btn--secondary">
            Ver productos
          </router-link>
        </div>

        <!-- Información de contacto -->
        <div class="error-help">
          <p class="error-help-text">
            Si el problema persiste, puedes contactarnos:
          </p>
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
</script>
