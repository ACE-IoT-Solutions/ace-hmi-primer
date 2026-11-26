<script setup lang="ts">
import { computed, ref } from "vue";
import { lifecycleCases } from "../data/lifecycle-cases";
const index = ref(0),
  selected = ref<string[]>([]),
  checked = ref(false);
const current = computed(() => lifecycleCases[index.value]!);
const complete = computed(
  () =>
    current.value.required.every((id) => selected.value.includes(id)) &&
    selected.value.length === current.value.required.length,
);
</script>
<template>
  <section class="panel exercise-panel">
    <span class="eyebrow">S12 · Lifecycle tabletop</span>
    <h2>Follow the change beyond the graphic.</h2>
    <label class="field"
      >Review case<select
        v-model.number="index"
        @change="
          selected = [];
          checked = false;
        "
      >
        <option v-for="(item, i) in lifecycleCases" :key="item.id" :value="i">
          {{ item.title }}
        </option>
      </select></label
    >
    <p class="lead">{{ current.prompt }}</p>
    <form @submit.prevent="checked = true">
      <label v-for="choice in current.choices" :key="choice[0]" class="toggle"
        ><input v-model="selected" type="checkbox" :value="choice[0]" />{{
          choice[1]
        }}</label
      ><button>Review lifecycle actions</button>
    </form>
    <div v-if="checked" class="notice" role="status">
      <strong>{{
        complete
          ? "The necessary review actions are included."
          : "Review the impacts and remove the shortcut."
      }}</strong>
      <p>{{ current.result }}</p>
    </div>
    <p class="source">
      § {{ current.clause }} · Standard guidance; toolkit and in-service changes
      include mandatory MOC requirements. Cases and answer selections are ACE
      applied exercises.
    </p>
  </section>
</template>
