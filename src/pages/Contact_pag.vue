<template>
    <Header />
    <Contact />
    <Footer />
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/Header_comp.vue'
import Contact from "../components/Contact_comp.vue";
import Footer from '../components/Footer_comp.vue'
import Cart from '../components/Cart_comp.vue'

const showCart = ref(false)
</script>
