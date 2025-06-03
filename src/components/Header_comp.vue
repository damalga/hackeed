<template>
  <header class="header">
    <nav class="header-nav">
      <div class="header-left">
        <router-link to="/shop" class="header-link">Shop</router-link>
        <router-link to="/about" class="header-link">About</router-link>
      </div>
      <div class="header-logo">
        <router-link to="/" class="logo-link">hackonlin.es</router-link>
      </div>
      <div class="header-right">
        <router-link to="/account" class="header-link">Account</router-link>
        <button class="header-cart" @click="$emit('toggle-cart')">Cart</button>
      </div>
    </nav>
  </header>
</template>
