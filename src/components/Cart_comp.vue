<template>
  <transition name="slide">
    <aside v-if="show" class="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50 p-6 flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Tu carrito</h2>
        <button @click="$emit('close')" class="text-xl">&times;</button>
      </div>
      <div class="flex-1">
        <!-- Aquí los productos añadidos al carrito -->
        <p class="text-gray-500">Carrito vacío... (to do)</p>
      </div>
      <button class="mt-4 w-full px-4 py-2 rounded bg-black text-white font-bold hover:bg-gray-900 transition">Finalizar compra</button>
    </aside>
  </transition>
</template>

<script setup>
defineProps(['show'])
defineEmits(['close'])
</script>
