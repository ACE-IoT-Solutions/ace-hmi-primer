<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import {
  valveDiagnostic,
  valveTolerance,
  valveTravelAllowance,
} from "../lib/coil-diagnostics";
const props = defineProps<{ snapshot: LabSnapshot }>();
const diagnostic = computed(() => valveDiagnostic(props.snapshot));
const point = computed(() => props.snapshot.points.valvePosition);
</script>
<template>
  <div class="valve-proof" :class="{ 'proof-mismatch': diagnostic.mismatch }">
    <strong>{{ diagnostic.label }}</strong>
    <span
      >Effective command {{ snapshot.valveCommand }}% / Position feedback
      {{
        snapshot.valvePosition === null
          ? "Unavailable"
          : `${snapshot.valvePosition}%`
      }}{{
        point.quality === "good" && snapshot.commState !== "disconnected"
          ? ""
          : " · retained / unverified"
      }}</span
    >
    <span
      >Position quality:
      {{
        snapshot.valvePosition === null
          ? "UNAVAILABLE"
          : point.quality.toUpperCase()
      }}<template v-if="point.ageSeconds !== undefined">
        · sample age {{ point.ageSeconds }} s</template
      ></span
    >
    <small
      >Command age {{ snapshot.valveCommandAgeSeconds }} s · travel allowance
      {{ valveTravelAllowance }} s · tolerance ±{{ valveTolerance }} percentage
      points</small
    >
    <small>{{ diagnostic.detail }}</small>
  </div>
</template>
<style scoped>
.valve-proof {
  display: grid;
  gap: 0.35rem;
}
.proof-mismatch {
  border-left: 4px solid #b66b12;
  padding-left: 0.65rem;
}
small {
  font-size: 0.8rem;
}
</style>
