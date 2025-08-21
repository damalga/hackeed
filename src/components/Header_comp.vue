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
        <router-link to="/cart" class="header-cart">
          Cart
          <span v-if="cartStore.totalItems > 0" class="cart-info">
            ({{ cartStore.totalItems }}) €{{ cartStore.totalPrice }}
          </span>
        </router-link>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useCartStore } from '@/stores/cartStore'

const cartStore = useCartStore()
</script>

<style scoped>
/* Estilos incluidos desde _cart.scss */
</style>
