<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="footer-links">
        <router-link to="/about" class="header-link">Sobre nosotros</router-link>
        <router-link to="/sfaq" class="footer-link">SFAQ</router-link>
        <router-link to="/contact" class="footer-link">Contacto</router-link>
      </div>
      <div class="footer-claim">
        <span>Hackeed(.es) — Todos los derechos reservados.</span>
      </div>
    </div>
    <div class="footer-extra">
      <span>&copy; {{ new Date().getFullYear() }} hackeed.es</span>
    </div>
  </footer>
</template>
