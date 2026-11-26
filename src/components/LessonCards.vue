<script setup lang="ts">
import type { Lesson } from "../data/lessons";
defineProps<{ cards: NonNullable<Lesson["cards"]> }>();
</script>
<template>
  <section
    v-for="card in cards"
    :key="card.title"
    class="lesson-note requirement-card"
  >
    <h3>{{ card.title }}</h3>
    <ol>
      <li v-for="item in card.items" :key="item">{{ item }}</li>
    </ol>
    <p class="source">§ {{ card.clause }} · {{ card.basis }}</p>
  </section>
</template>
