<template>
  <Header />
  <main class="sfaq-main">
    <div class="sfaq-container">
      <section class="sfaq-section">
        <h3>SFAQ</h3>
        <h4>Supposed Frequently Asked Questions</h4>
        <p>
          - Sí, has leído bien: "Supuestas Preguntas Frecuentes". Acabamos de abrir y todavía no
          tenemos suficientes preguntas reales como para llenar esto, así que hemos anticipado las
          más obvias. Durante los próximos 3 meses esto será un SFAQ provisional. Luego, cuando
          tengáis tiempo de preguntarnos cosas raras, pasará a ser un FAQ de verdad.
        </p>
        <p>
          Si tu duda no está aquí o prefieres hablar con humanos, pásate por nuestra página de
          <router-link to="/contact" class="footer-link">Contacto</router-link>.
        </p>
        <h4>Pagos y datos</h4>
        <h5>¿Cómo pago?</h5>
        <p>
          - Con Stripe. Tarjeta y demás inventos modernos. Nosotros no vemos ni guardamos tu número
          de tarjeta, todo eso lo gestiona Stripe.
        </p>
        <h5>¿Qué hacéis con mis datos?</h5>
        <p>
          - Lo mínimo para que el pedido te llegue. Nada de vender listas ni spamearte con aburridos
          correos electrónicos. Ni siquiera gestionamos usuarios: todas las compras se hacen como
          invitado (guest user), así que de momento, a menos que veamos que nos hace falta, no hay
          logueos ni registros.
        </p>
        <br />
        <h4>Envíos</h4>
        <h5>¿Desde dónde enviáis?</h5>
        <p>
          - Ahora mismo desde España (Madrid). Si vives cerca, llegará rápido. Si estás en otro país
          de la UE, tardará un poco más.
        </p>
        <h5>¿Cuánto tarda en llegar mi pedido?</h5>
        <p>
          - Normalmente entre 2 y 5 días laborables en la península con GLS. Asegúrate de poner bien
          tu email para recibir actualizaciones del estado de tu pedido.
        </p>
        <h5>¿Cuánto cuesta el envío?</h5>
        <p>- Lo verás antes de pagar, nada de sorpresas raras.</p>
        <br />
        <h4>Devoluciones</h4>
        <h5>¿Puedo devolver algo?</h5>
        <p>- Sí, tienes 14 días desde que recibes el producto (como dice la ley).</p>
        <h5>¿Quién paga el envío de la devolución?</h5>
        <p>- Tú. A no ser que el error sea nuestro, en ese caso lo cubrimos nosotros.</p>
        <h5>¿Y si me llega roto?</h5>
        <p>- Nos escribes con fotos y te mandamos otro o te devolvemos la pasta.</p>
      </section>
    </div>
  </main>
  <Footer />
</template>

<script setup>
import { ref } from 'vue'
import { usePageMeta } from '@/composables/usePageMeta'
import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Cart from '../components/Cart_comp.vue'

// SEO Meta Tags
usePageMeta({
  title: 'Preguntas Frecuentes - FAQ sobre Envíos, Pagos y Devoluciones | Hackeed',
  description:
    'Resolvemos todas tus dudas: formas de pago con Stripe, envíos en 2-5 días, devoluciones en 14 días, política de privacidad. Compra segura en Hackeed.',
  keywords:
    'preguntas frecuentes hackeed, ayuda compra online, envíos españa, devoluciones, formas de pago, tiempos entrega',
  url: 'https://hackeed.com/sfaq',
  image: 'https://hackeed.com/images/og-faq.jpg',
})
</script>
