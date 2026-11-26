<script setup lang="ts">
import { computed } from "vue";
import type { LabSnapshot } from "../lib/lab";
import { waterDiagnostic, enteringWaterRange } from "../lib/coil-diagnostics";
import { useTemperatureUnits } from "../lib/units";
const props = defineProps<{ snapshot: LabSnapshot }>();
const units = useTemperatureUnits();
const diagnostic = computed(() => waterDiagnostic(props.snapshot));
const readings = computed(() => [
  { key: "enteringWater" as const, label: "Entering water" },
  { key: "leavingWater" as const, label: "Leaving water" },
]);
</script>
<template>
  <div class="water-diagnostics">
    <strong>Cooling coil / water side</strong>
    <dl>
      <div v-for="reading in readings" :key="reading.key">
        <dt>{{ reading.label }}</dt>
        <dd>
          {{
            snapshot[reading.key] === null
              ? "Unavailable"
              : units.temperature(snapshot[reading.key]!)
          }}<small
            >{{
              snapshot[reading.key] === null
                ? "UNAVAILABLE"
                : snapshot.points[reading.key].quality.toUpperCase()
            }}
            · sample age
            {{ snapshot.points[reading.key].ageSeconds ?? "unknown" }} s</small
          >
        </dd>
      </div>
    </dl>
    <strong v-if="diagnostic.warm"
      >Entering water above example supply range</strong
    >
    <span
      >Example entering-water range
      {{ units.temperature(enteringWaterRange[0]) }}–{{
        units.temperature(enteringWaterRange[1])
      }}</span
    >
    <span
      >Water ΔT (leaving − entering):
      {{
        diagnostic.delta === null
          ? "Unknown · current pair unavailable"
          : units.delta(diagnostic.delta)
      }}</span
    >
    <small
      >No water-flow sensor is modeled. ΔT alone does not prove flow or identify
      a stuck valve.</small
    >
  </div>
</template>
<style scoped>
.water-diagnostics {
  display: grid;
  gap: 0.35rem;
}
dl {
  margin: 0;
  display: grid;
  gap: 0.5rem;
}
dd {
  margin: 0;
  font-weight: 700;
}
dt {
  font-size: 0.8rem;
}
small {
  display: block;
  font-size: 0.8rem;
  font-weight: 400;
}
</style>
