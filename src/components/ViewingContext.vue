<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { LabSnapshot } from "../lib/lab";
import OperatingContext from "./OperatingContext.vue";
defineProps<{ snapshot: LabSnapshot; target: number }>();
const device = ref("tablet"),
  vision = ref("normal"),
  brightness = ref(100),
  tapped = ref(false);
const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
const filter = computed(
  () =>
    `brightness(${brightness.value / 100}) ${vision.value === "normal" ? "" : vision.value === "grayscale" ? "grayscale(1)" : `url(#${id}-${vision.value})`}`,
);
</script>
<template>
  <section class="panel exercise-panel">
    <span class="eyebrow">S10 · Viewing context</span>
    <h2>The same information, at a different working position.</h2>
    <div class="clinic-controls">
      <label class="field"
        >Working device<select v-model="device">
          <option value="tablet">Mechanical-room tablet</option>
          <option value="wall">Wall screen at a distance</option>
          <option value="night">Dim night control room</option>
        </select></label
      ><label class="field"
        >Color-view approximation<select v-model="vision">
          <option value="normal">Normal color</option>
          <option value="grayscale">Grayscale</option>
          <option value="protan">Red sensitivity reduced</option>
          <option value="deutan">Green sensitivity reduced</option>
          <option value="tritan">Blue sensitivity reduced</option>
        </select></label
      ><label class="field"
        >Display brightness example · {{ brightness }}%<input
          v-model.number="brightness"
          type="range"
          min="50"
          max="110"
      /></label>
    </div>
    <svg width="0" height="0" aria-hidden="true">
      <defs>
        <filter :id="`${id}-protan`">
          <feColorMatrix
            type="matrix"
            values=".567 .433 0 0 0 .558 .442 0 0 0 0 .242 .758 0 0 0 0 0 1 0"
          />
        </filter>
        <filter :id="`${id}-deutan`">
          <feColorMatrix
            type="matrix"
            values=".625 .375 0 0 0 .7 .3 0 0 0 0 .3 .7 0 0 0 0 0 1 0"
          />
        </filter>
        <filter :id="`${id}-tritan`">
          <feColorMatrix
            type="matrix"
            values=".95 .05 0 0 0 0 .433 .567 0 0 0 0 .475 .525 0 0 0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
    <div class="viewing-surround" :class="device">
      <div class="hmi-screen viewing-display" :style="{ filter }">
        <OperatingContext :snapshot="snapshot" :target="target" />
      </div>
      <button @click="tapped = true">Open equipment detail</button>
    </div>
    <p v-if="tapped" role="status">
      Navigation selected. No process command sent.
    </p>
    <div class="lesson-note">
      <strong>Review on real hardware with the actual users.</strong>
      <p>
        Color matrices, size and brightness here are illustrative
        approximations. They do not reproduce an individual’s vision or a
        measured room. Check viewing distance, reflections, ambient light,
        hearing, age-related vision changes, aspect ratio and touch accuracy in
        the actual workspace. A wall overview and a tablet control task need
        different layout decisions.
      </p>
    </div>
    <p class="source">
      § 4.3.1; 5.2.1.1–5.2.1.3; 7.3 · Standard guidance. Brightness range, color
      matrices and touch geometry are ACE demonstration choices.
    </p>
  </section>
</template>
