<template>
  <header class="flex justify-between items-center border-b pb-6 mb-12 relative">
    <nav class="flex-1 flex justify-start">
      <a href="/shop" class="hover:underline text-lg font-medium">Shop</a>
    </nav>
    <div class="flex-1 flex justify-center">
      <router-link to="/" class="text-3xl font-bold tracking-tight">hackonlin.es</router-link>
    </div>
    <nav class="flex-1 flex justify-end">
      <button @click="$emit('toggle-cart')" class="hover:underline text-lg font-medium">🛒</button>
    </nav>
  </header>
</template>
