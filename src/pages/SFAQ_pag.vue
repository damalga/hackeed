<template>
  <Header />
  <main class="sfaq-main">
    <div class="sfaq-container">
      <section class="sfaq-section">
        <h3>SFAQ (Supposedly Frequently Asked Questions)</h3>

        <h4>Pagos y datos</h4>
        <h5>¿Cómo pago?</h5>
        <p>
          - Con Stripe. Tarjeta y demás inventos modernos. Nosotros no vemos ni guardamos tu número
          de tarjeta, todo eso lo gestiona Stripe.
        </p>
        <h5>¿Qué hacéis con mis datos?</h5>
        <p>
          - Lo mínimo para que el pedido llegue a tu casa. Nada de vender listas ni spamearte con
          newsletters infinitas.
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
          - Normalmente entre 2 y 5 días laborables en la península. A veces más si Correos decide
          filosofar.
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
import Header from '../components/Header_comp.vue'
import Footer from '../components/Footer_comp.vue'
import Cart from '../components/Cart_comp.vue'
</script>
