<template>
  <section id="products" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-24">
    <div v-for="item in [1,2,3]" :key="item" class="border border-black rounded-2xl">
      <div class="p-4">
        <div class="aspect-square bg-gray-200 mb-4 rounded-xl" />
        <h3 class="font-semibold text-lg">Producto {{ item }}</h3>
        <p class="text-gray-600 text-sm">Descripción breve y directa.</p>
        <button class="mt-4 w-full px-4 py-2 rounded bg-black text-white font-bold hover:bg-gray-900 transition">Comprar</button>
      </div>
    </div>
  </section>
</template>
