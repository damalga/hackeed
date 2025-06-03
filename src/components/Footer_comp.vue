<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="footer-links">
        <router-link to="/faq" class="footer-link">FAQ</router-link>
        <router-link to="/contact" class="footer-link">Contacto</router-link>
      </div>
      <div class="footer-claim">
        <span>hackonlin.es — Hardware hacker, gadgets de culto y electrónica sin postureo.</span>
      </div>
    </div>
    <div class="footer-extra">
      <span>&copy; {{ new Date().getFullYear() }} hackonlin.es</span>
    </div>
  </footer>
</template>
