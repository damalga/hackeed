<template>
    <section class="hero">
        <div class="hero-slider">
            <div
                class="hero-slide"
                v-for="(slide, i) in slides"
                :key="i"
                :class="{ active: i === activeIndex }"
                v-show="i === activeIndex"
            >
                <img :src="slide.img" :alt="slide.title" class="hero-img" />
                <h2 class="hero-title">{{ slide.title }}</h2>
                <p class="hero-desc">{{ slide.desc }}</p>
                <router-link :to="slide.link" class="hero-cta">{{
                    slide.cta
                }}</router-link>
            </div>
            <button class="hero-arrow hero-arrow--left" @click="prevSlide">
                &#8592;
            </button>
            <button class="hero-arrow hero-arrow--right" @click="nextSlide">
                &#8594;
            </button>
        </div>
        <div class="hero-dots">
            <span
                v-for="(slide, i) in slides"
                :key="i"
                :class="{ active: i === activeIndex }"
                @click="activeIndex = i"
            ></span>
        </div>
    </section>
</template>

<script setup>
import { ref } from "vue";

import slides from '../data/slider_hero_data.js'

const activeIndex = ref(0);

function nextSlide() {
    activeIndex.value = (activeIndex.value + 1) % slides.length;
}

function prevSlide() {
    activeIndex.value = (activeIndex.value - 1 + slides.length) % slides.length;
}
</script>
