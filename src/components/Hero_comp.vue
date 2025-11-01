<template>
  <section class="hero">
    <div class="hero-container">
      <!-- Image section -->
      <div class="hero-image">
        <img src="../../public/images/hero/1200x1200-standard.png" alt="Hero Image" class="hero-img" />
      </div>

      <!-- Text section -->
      <div class="hero-text">
        <h1 class="hero-title">Bienvenido a Hackeed</h1>
        <p class="hero-desc">
          Te ofrecemos un catálogo de herramientas tecnológicas para abrir el mundo...
          <br></br>
          <br></br>
          O para construirlo a tu gusto.
        </p>
        <button class="hero-cta">
          <router-link to="/shop"> Explorar Productos </router-link>
        </button>
      </div>
    </div>
  </section>
</template>
