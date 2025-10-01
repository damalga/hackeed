<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="footer-links">
        <router-link to="/about" class="header-link">Sobre nosotros</router-link>
        <router-link to="/sfaq" class="footer-link">SFAQ</router-link>
        <router-link to="/contact" class="footer-link">Contacto</router-link>
        <router-link to="/privacy" class="footer-link">Privacidad</router-link>
      </div>
      <div class="footer-claim">
        <span class="footer-claim">
<<<<<<< HEAD
          Este sitio usa cookies técnicas necesarias para procesar pagos (Stripe).
          <br />Para más información en lo que respecta al uso de tus datos por favor visita:
=======
          Este sitio usa cookies técnicas necesarias para procesar pagos (Stripe). Para más
          información en lo que respecta al uso de tus datos por favor visita:
>>>>>>> feat/stripe
          <router-link to="/sfaq" class="footer-link">SFAQ</router-link>
        </span>
        <br />
        <span>
          &copy; {{ new Date().getFullYear() }} Hackeed(.es) — Todos los derechos reservados.
        </span>
      </div>
    </div>
  </footer>
</template>
