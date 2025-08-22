<template>
    <div>
        <Header />
        <Hero />
        <Products
            title="Productos destacados"
            :limit="3"
            :show-title="true"
        />
        <Footer />
    </div>
</template>

<script setup>
import Header from "../components/Header_comp.vue";
import Hero from "../components/Hero_comp.vue";
import Products from "../components/Products_comp.vue";
import Contact from "../components/Contact_comp.vue";
import Footer from "../components/Footer_comp.vue";
</script>
